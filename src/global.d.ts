declare global {
	interface ImportMeta {
		dir: string;
	}

	interface Window {
		documentPictureInPicture: {
			requestWindow: (arg?: {
				height?: number;
				width?: number;
				preferInitialWindowPlacement?: boolean;
			}) => Promise<Window | undefined>;
		};
	}
}

export { };
