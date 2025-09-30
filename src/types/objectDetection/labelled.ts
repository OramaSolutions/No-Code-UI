// Types matching the actual data used in Labelled.js

export interface LabelledState {
	imageUrls: string[];
	imageFolder: File | null;
	loading: boolean;
	resizecheck: boolean;
	width: number | null;
	open: boolean;
	close: any;
	openImport: boolean;
	closeImport: boolean;
	selectedFile: File | null;
	isDirty: string;
}
// Types for labelled data and annotation formats

export interface Label {
	class: string;
	bbox: [number, number, number, number]; // [x, y, width, height]
	confidence?: number;
}

export interface LabelledImage {
	imageId: string;
	imageUrl: string;
	labels: Label[];
}

export interface LabelledDataset {
	images: LabelledImage[];
	createdAt: string;
}
