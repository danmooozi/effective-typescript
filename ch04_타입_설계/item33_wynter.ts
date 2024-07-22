type RecordingType = 'studio' | 'live';
interface Album {
	artist: string;
	title: string;
	rleaseDate: Date;
	recordingType: RecordingType;
}


function plunk<T>(records: T[], key: keyof T) {
	return records.map(r => r[key]);
}
const albums:Album[] = [{artist:'g', title:'f', rleaseDate:new Date(), recordingType: 'studio'}]
const Dates = plunk(albums, 'rleaseDate')