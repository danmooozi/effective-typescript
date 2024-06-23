### 아이템6 편집기를 사용하여 타입 시스템 사용하기

go to definition 은 어떻게 이루어지는가 ?

- **프로젝트 파일 분석 및 인덱싱**:
`tsserver`는 프로젝트 내의 모든 파일을 분석하고 심볼 테이블을 구축합니다. 이 테이블에는 변수, 함수, 클래스 등의 정의 위치가 저장됩니다.
- **심볼 조회**:
사용자가 에디터에서 `go to definition` 명령을 실행하면, `tsserver`는 현재 커서 위치의 심볼을 식별하고, 심볼 테이블에서 해당 심볼의 정의 위치를 찾습니다.
- **정의 위치 반환**:
심볼의 정의 위치를 찾아 에디터에 반환하며, 에디터는 사용자를 해당 위치로 이동시킵니다

1. 실제 코드를 보면 Source 찾는 클라이언트 코드가 찾아가려고 한다.
2. 심볼과 위치가 정의될때 미리 등록해 놓고 위치만 나중에 뱉어주는걸로 간다.

```tsx
private findSourceDefinition(args: protocol.FileLocationRequestArgs): readonly protocol.DefinitionInfo[] {
    const { file, project } = this.getFileAndProject(args);
    const position = this.getPositionInFile(args, file);
    const unmappedDefinitions = project.getLanguageService().getDefinitionAtPosition(file, position);
    let definitions: readonly DefinitionInfo[] = this.mapDefinitionInfoLocations(unmappedDefinitions || emptyArray, project).slice();
    const needsJsResolution = this.projectService.serverMode === LanguageServiceMode.Semantic && (
        !some(definitions, d => toNormalizedPath(d.fileName) !== file && !d.isAmbient) ||
        some(definitions, d => !!d.failedAliasResolution)
  );

    if (needsJsResolution) {
        const definitionSet = createSet<DefinitionInfo>(
            d => d.textSpan.start,
            getDocumentSpansEqualityComparer(this.host.useCaseSensitiveFileNames),
        );
        definitions?.forEach(d => definitionSet.add(d));
        const noDtsProject = project.getNoDtsResolutionProject(file);
        const ls = noDtsProject.getLanguageService();
        const jsDefinitions = ls.getDefinitionAtPosition(file, position, /*searchOtherFilesOnly*/ true, /*stopAtAlias*/ false)
            ?.filter(d => toNormalizedPath(d.fileName) !== file);
        if (some(jsDefinitions)) {
            for (const jsDefinition of jsDefinitions) {
                if (jsDefinition.unverified) {
                    const refined = tryRefineDefinition(jsDefinition, project.getLanguageService().getProgram()!, ls.getProgram()!);
                    if (some(refined)) {
                        for (const def of refined) {
                            definitionSet.add(def);
                        }
                        continue;
                    }
                }
                definitionSet.add(jsDefinition);
            }
        }
        else {
            const ambientCandidates = definitions.filter(d => toNormalizedPath(d.fileName) !== file && d.isAmbient);
            for (const candidate of some(ambientCandidates) ? ambientCandidates : getAmbientCandidatesByClimbingAccessChain()) {
                const fileNameToSearch = findImplementationFileFromDtsFileName(candidate.fileName, file, noDtsProject);
                if (!fileNameToSearch) continue;
                const info = this.projectService.getOrCreateScriptInfoNotOpenedByClient(
                    fileNameToSearch,
                    noDtsProject.currentDirectory,
                    noDtsProject.directoryStructureHost,
                    /*deferredDeleteOk*/ false,
                );
                if (!info) continue;
                if (!noDtsProject.containsScriptInfo(info)) {
                    noDtsProject.addRoot(info);
                    noDtsProject.updateGraph();
                }
                const noDtsProgram = ls.getProgram()!;
                const fileToSearch = Debug.checkDefined(noDtsProgram.getSourceFile(fileNameToSearch));
                for (const match of searchForDeclaration(candidate.name, fileToSearch, noDtsProgram)) {
                    definitionSet.add(match);
                }
            }
        }
        definitions = arrayFrom(definitionSet.values());
  }

	definitions = definitions.filter(d => !d.isAmbient && !d.failedAliasResolution);
	return this.mapDefinitionInfo(definitions, project);
	
		/*
		
		...
		
		*/

    function searchForDeclaration(declarationName: string, fileToSearch: SourceFile, noDtsProgram: Program) {
        const matches = FindAllReferences.Core.getTopMostDeclarationNamesInFile(declarationName, fileToSearch);
        return mapDefined(matches, match => {
            const symbol = noDtsProgram.getTypeChecker().getSymbolAtLocation(match);
            const decl = getDeclarationFromName(match);
            if (symbol && decl) {
                // I think the last argument to this is supposed to be the start node, but it doesn't seem important.
                // Callers internal to GoToDefinition already get confused about this.
                return GoToDefinition.createDefinitionInfo(decl, noDtsProgram.getTypeChecker(), symbol, decl, /*unverified*/ true);
            }
        });
    }
}
```

```tsx
function getDefinitionFromSymbol(typeChecker: TypeChecker, symbol: Symbol, node: Node, failedAliasResolution?: boolean, excludeDeclaration?: Node): DefinitionInfo[] | undefined {
    const filteredDeclarations = filter(symbol.declarations, d => d !== excludeDeclaration);
    const signatureDefinition = getConstructSignatureDefinition() || getCallSignatureDefinition();
    if (signatureDefinition) {
        return signatureDefinition;
    }
    const withoutExpandos = filter(filteredDeclarations, d => !isExpandoDeclaration(d));
    const results = some(withoutExpandos) ? withoutExpandos : filteredDeclarations;
    return map(results, declaration => createDefinitionInfo(declaration, typeChecker, symbol, node, /*unverified*/ false, failedAliasResolution));

    function getConstructSignatureDefinition(): DefinitionInfo[] | undefined {
        // Applicable only if we are in a new expression, or we are on a constructor declaration
        // and in either case the symbol has a construct signature definition, i.e. class
        if (symbol.flags & SymbolFlags.Class && !(symbol.flags & (SymbolFlags.Function | SymbolFlags.Variable)) && (isNewExpressionTarget(node) || node.kind === SyntaxKind.ConstructorKeyword)) {
            const cls = find(filteredDeclarations, isClassLike);
            return cls && getSignatureDefinition(cls.members, /*selectConstructors*/ true);
        }
    }

    function getCallSignatureDefinition(): DefinitionInfo[] | undefined {
        return isCallOrNewExpressionTarget(node) || isNameOfFunctionDeclaration(node)
            ? getSignatureDefinition(filteredDeclarations, /*selectConstructors*/ false)
            : undefined;
    }

    function getSignatureDefinition(signatureDeclarations: readonly Declaration[] | undefined, selectConstructors: boolean): DefinitionInfo[] | undefined {
        if (!signatureDeclarations) {
            return undefined;
        }
        const declarations = signatureDeclarations.filter(selectConstructors ? isConstructorDeclaration : isFunctionLike);
        const declarationsWithBody = declarations.filter(d => !!(d as FunctionLikeDeclaration).body);

        // declarations defined on the global scope can be defined on multiple files. Get all of them.
        return declarations.length
            ? declarationsWithBody.length !== 0
                ? declarationsWithBody.map(x => createDefinitionInfo(x, typeChecker, symbol, node))
                : [createDefinitionInfo(last(declarations), typeChecker, symbol, node, /*unverified*/ false, failedAliasResolution)]
            : undefined;
    }
}

```

```tsx
export function createDefinitionInfo(declaration: Declaration, checker: TypeChecker, symbol: Symbol, node: Node, unverified?: boolean, failedAliasResolution?: boolean): DefinitionInfo {
    const symbolName = checker.symbolToString(symbol); // Do not get scoped name, just the name of the symbol
    const symbolKind = SymbolDisplay.getSymbolKind(checker, symbol, node);
    const containerName = symbol.parent ? checker.symbolToString(symbol.parent, node) : "";
    return createDefinitionInfoFromName(checker, declaration, symbolKind, symbolName, containerName, unverified, failedAliasResolution);
}
// 막상 가보면 특별한게 아니라 위치랑 정보데이터 넣어서 집어 넣음
```

### 아이템7 타입이 값들의 집합이라고 생각하기

- 개념적으로 이렇게 이해하면 굉장히 도움이 됨.
- 겹쳐지는 집합으로 표현하는게 중요하다.
- 한 객체의 추가적인 속성이 타입 선언에 언급되지 않더라도 그 타입에 속할 수 있습니다.

### 아이템8 타입 공간과 값 공간의 심벌 구분하기

- 모든 값은 타입을 가지지만, 타입은 값을 가지지 않고 타입 공간에 분리되어 있다.
- class 나 enum 은 둘 다 사용가능하다.

### 아이템 9 타입 단언보다는 타입 선언을 사용하기

```tsx
const alice: Person = { name : 'Alice' }; ✅
const alice = { name : 'bob' } as Person; ❌
```

### 아이템10 객체 래퍼 타입 피하기

- String 대신 string , Number 대신 number,Boolean 대신 boolean, Symbol 대신 symbol
