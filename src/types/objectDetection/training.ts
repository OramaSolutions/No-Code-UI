// Types for training configuration, progress, metrics, and results

export interface TrainingConfig {
	epochs: number;
	batchSize: number;
	learningRate: number;
	optimizer: string;
	lossFunction: string;
}

export interface TrainingProgress {
	currentEpoch: number;
	totalEpochs: number;
	status: 'not_started' | 'in_progress' | 'completed' | 'failed';
}

export interface TrainingMetrics {
	accuracy?: number;
	loss?: number;
	precision?: number;
	recall?: number;
	[key: string]: number | undefined;
}

export interface TrainingResult {
	metrics: TrainingMetrics;
	modelPath: string;
	completedAt: string;
}
