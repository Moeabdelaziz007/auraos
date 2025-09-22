// Data Analysis and Visualization Tools for AuraOS
// Zero-cost data analysis and chart generation

import { FirestoreService } from '../client/src/lib/firebase';

/**
 * A collection of tools for data analysis and visualization.
 */
export class DataAnalysisTools {
  /**
   * Analyzes a dataset using the specified analysis type.
   * @param {any[]} data The dataset to analyze.
   * @param {AnalysisType} analysisType The type of analysis to perform.
   * @returns {Promise<AnalysisResult>} A promise that resolves with the analysis result.
   */
  static async analyzeDataset(data: any[], analysisType: AnalysisType): Promise<AnalysisResult> {
    try {
      switch (analysisType) {
        case 'descriptive':
          return this.descriptiveAnalysis(data);
        case 'correlation':
          return this.correlationAnalysis(data);
        case 'regression':
          return this.regressionAnalysis(data);
        case 'clustering':
          return this.clusteringAnalysis(data);
        case 'time_series':
          return this.timeSeriesAnalysis(data);
        case 'anomaly_detection':
          return this.anomalyDetection(data);
        case 'sentiment_analysis':
          return this.sentimentAnalysis(data);
        case 'text_analysis':
          return this.textAnalysis(data);
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }
    } catch (error) {
      return {
        success: false,
        analysisType,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Descriptive Statistics Analysis
   */
  private static descriptiveAnalysis(data: number[]): AnalysisResult {
    if (data.length === 0) {
      return {
        success: false,
        analysisType: 'descriptive',
        error: 'No data provided',
        timestamp: new Date().toISOString(),
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    
    // Calculate median
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
      : sorted[Math.floor(n / 2)];
    
    // Calculate mode
    const frequency: { [key: number]: number } = {};
    data.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mode = Object.keys(frequency).reduce((a, b) => 
      frequency[parseFloat(a)] > frequency[parseFloat(b)] ? a : b
    );
    
    // Calculate variance and standard deviation
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate quartiles
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    
    // Calculate skewness and kurtosis
    const skewness = this.calculateSkewness(data, mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(data, mean, standardDeviation);

    return {
      success: true,
      analysisType: 'descriptive',
      results: {
        basicStats: {
          count: n,
          sum: parseFloat(sum.toFixed(2)),
          mean: parseFloat(mean.toFixed(2)),
          median: parseFloat(median.toFixed(2)),
          mode: parseFloat(mode),
          min: Math.min(...data),
          max: Math.max(...data),
          range: Math.max(...data) - Math.min(...data),
        },
        variability: {
          variance: parseFloat(variance.toFixed(2)),
          standardDeviation: parseFloat(standardDeviation.toFixed(2)),
          coefficientOfVariation: parseFloat((standardDeviation / mean * 100).toFixed(2)),
        },
        quartiles: {
          q1: parseFloat(q1.toFixed(2)),
          q2: parseFloat(median.toFixed(2)),
          q3: parseFloat(q3.toFixed(2)),
          iqr: parseFloat(iqr.toFixed(2)),
        },
        distribution: {
          skewness: parseFloat(skewness.toFixed(4)),
          kurtosis: parseFloat(kurtosis.toFixed(4)),
          skewnessInterpretation: this.interpretSkewness(skewness),
          kurtosisInterpretation: this.interpretKurtosis(kurtosis),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Correlation Analysis
   */
  private static correlationAnalysis(data: CorrelationData[]): AnalysisResult {
    if (data.length < 2) {
      return {
        success: false,
        analysisType: 'correlation',
        error: 'Need at least 2 data points for correlation analysis',
        timestamp: new Date().toISOString(),
      };
    }

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    
    const correlation = this.calculateCorrelation(xValues, yValues);
    const rSquared = correlation * correlation;
    
    // Calculate confidence interval
    const n = data.length;
    const tValue = 1.96; // 95% confidence interval
    const standardError = Math.sqrt((1 - rSquared) / (n - 2));
    const marginOfError = tValue * standardError;
    const lowerBound = correlation - marginOfError;
    const upperBound = correlation + marginOfError;

    return {
      success: true,
      analysisType: 'correlation',
      results: {
        correlationCoefficient: parseFloat(correlation.toFixed(4)),
        rSquared: parseFloat(rSquared.toFixed(4)),
        strength: this.interpretCorrelationStrength(Math.abs(correlation)),
        direction: correlation > 0 ? 'positive' : 'negative',
        confidenceInterval: {
          lower: parseFloat(lowerBound.toFixed(4)),
          upper: parseFloat(upperBound.toFixed(4)),
          level: 95,
        },
        interpretation: this.interpretCorrelation(correlation),
        sampleSize: n,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Linear Regression Analysis
   */
  private static regressionAnalysis(data: CorrelationData[]): AnalysisResult {
    if (data.length < 2) {
      return {
        success: false,
        analysisType: 'regression',
        error: 'Need at least 2 data points for regression analysis',
        timestamp: new Date().toISOString(),
      };
    }

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const n = data.length;

    // Calculate regression coefficients
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = yValues.reduce((acc, y, i) => 
      acc + Math.pow(y - (slope * xValues[i] + intercept), 2), 0);
    const ssTot = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    // Calculate standard errors
    const mse = ssRes / (n - 2);
    const seSlope = Math.sqrt(mse / (sumX2 - sumX * sumX / n));
    const seIntercept = Math.sqrt(mse * (1 / n + sumX * sumX / (n * (sumX2 - sumX * sumX / n))));

    return {
      success: true,
      analysisType: 'regression',
      results: {
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        coefficients: {
          slope: parseFloat(slope.toFixed(4)),
          intercept: parseFloat(intercept.toFixed(4)),
        },
        standardErrors: {
          slope: parseFloat(seSlope.toFixed(4)),
          intercept: parseFloat(seIntercept.toFixed(4)),
        },
        goodnessOfFit: {
          rSquared: parseFloat(rSquared.toFixed(4)),
          adjustedRSquared: parseFloat((1 - (1 - rSquared) * (n - 1) / (n - 2)).toFixed(4)),
          rootMeanSquareError: parseFloat(Math.sqrt(mse).toFixed(4)),
        },
        predictions: this.generatePredictions(xValues, slope, intercept),
        interpretation: this.interpretRegression(slope, rSquared),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * K-Means Clustering Analysis
   */
  private static clusteringAnalysis(data: PointData[]): AnalysisResult {
    if (data.length < 2) {
      return {
        success: false,
        analysisType: 'clustering',
        error: 'Need at least 2 data points for clustering',
        timestamp: new Date().toISOString(),
      };
    }

    const k = Math.min(3, Math.floor(Math.sqrt(data.length / 2))); // Optimal k
    const clusters = this.kMeansClustering(data, k);
    
    // Calculate cluster statistics
    const clusterStats = clusters.map((cluster, index) => {
      const centroid = this.calculateCentroid(cluster.points);
      const withinClusterSum = cluster.points.reduce((sum, point) => 
        sum + Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2), 0);
      
      return {
        clusterId: index,
        centroid,
        pointCount: cluster.points.length,
        withinClusterSum: parseFloat(withinClusterSum.toFixed(2)),
        averageDistance: parseFloat((withinClusterSum / cluster.points.length).toFixed(2)),
      };
    });

    // Calculate silhouette score
    const silhouetteScore = this.calculateSilhouetteScore(data, clusters);

    return {
      success: true,
      analysisType: 'clustering',
      results: {
        clusters: clusterStats,
        silhouetteScore: parseFloat(silhouetteScore.toFixed(4)),
        interpretation: this.interpretClustering(silhouetteScore),
        recommendations: this.clusteringRecommendations(clusters),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Time Series Analysis
   */
  private static timeSeriesAnalysis(data: TimeSeriesData[]): AnalysisResult {
    if (data.length < 3) {
      return {
        success: false,
        analysisType: 'time_series',
        error: 'Need at least 3 data points for time series analysis',
        timestamp: new Date().toISOString(),
      };
    }

    const values = data.map(d => d.value);
    const timestamps = data.map(d => d.timestamp);
    
    // Calculate trend
    const trend = this.calculateTrend(values);
    
    // Calculate seasonality (simplified)
    const seasonality = this.calculateSeasonality(values);
    
    // Calculate moving averages
    const movingAverages = this.calculateMovingAverages(values, 3);
    
    // Forecast next values
    const forecast = this.simpleForecast(values, 5);

    return {
      success: true,
      analysisType: 'time_series',
      results: {
        trend: {
          direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
          slope: parseFloat(trend.slope.toFixed(4)),
          strength: Math.abs(trend.slope),
        },
        seasonality: {
          detected: seasonality.detected,
          period: seasonality.period,
          strength: seasonality.strength,
        },
        movingAverages: movingAverages.map(ma => parseFloat(ma.toFixed(2))),
        forecast: forecast.map(f => parseFloat(f.toFixed(2))),
        interpretation: this.interpretTimeSeries(trend, seasonality),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Anomaly Detection
   */
  private static anomalyDetection(data: number[]): AnalysisResult {
    if (data.length < 4) {
      return {
        success: false,
        analysisType: 'anomaly_detection',
        error: 'Need at least 4 data points for anomaly detection',
        timestamp: new Date().toISOString(),
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = data.filter(x => x < lowerBound || x > upperBound);
    const outlierIndices = data.map((x, i) => x < lowerBound || x > upperBound ? i : -1)
      .filter(i => i !== -1);

    // Z-score based detection
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length);
    const zScoreOutliers = data.filter(x => Math.abs((x - mean) / stdDev) > 2);

    return {
      success: true,
      analysisType: 'anomaly_detection',
      results: {
        iqrMethod: {
          outliers: outliers,
          outlierIndices: outlierIndices,
          count: outliers.length,
          percentage: parseFloat(((outliers.length / data.length) * 100).toFixed(2)),
          bounds: {
            lower: parseFloat(lowerBound.toFixed(2)),
            upper: parseFloat(upperBound.toFixed(2)),
          },
        },
        zScoreMethod: {
          outliers: zScoreOutliers,
          count: zScoreOutliers.length,
          percentage: parseFloat(((zScoreOutliers.length / data.length) * 100).toFixed(2)),
          threshold: 2,
        },
        interpretation: this.interpretAnomalies(outliers.length, data.length),
        recommendations: this.anomalyRecommendations(outliers, data),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sentiment Analysis
   */
  private static sentimentAnalysis(data: TextData[]): AnalysisResult {
    if (data.length === 0) {
      return {
        success: false,
        analysisType: 'sentiment_analysis',
        error: 'No text data provided',
        timestamp: new Date().toISOString(),
      };
    }

    const sentiments = data.map(item => this.analyzeTextSentiment(item.text));
    const overallSentiment = this.calculateOverallSentiment(sentiments);
    
    const sentimentDistribution = {
      positive: sentiments.filter(s => s.sentiment === 'positive').length,
      negative: sentiments.filter(s => s.sentiment === 'negative').length,
      neutral: sentiments.filter(s => s.sentiment === 'neutral').length,
    };

    return {
      success: true,
      analysisType: 'sentiment_analysis',
      results: {
        overallSentiment: overallSentiment.sentiment,
        overallScore: parseFloat(overallSentiment.score.toFixed(4)),
        distribution: sentimentDistribution,
        averageConfidence: parseFloat((sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length).toFixed(4)),
        individualSentiments: sentiments,
        interpretation: this.interpretSentiment(overallSentiment),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Text Analysis
   */
  private static textAnalysis(data: TextData[]): AnalysisResult {
    if (data.length === 0) {
      return {
        success: false,
        analysisType: 'text_analysis',
        error: 'No text data provided',
        timestamp: new Date().toISOString(),
      };
    }

    const allText = data.map(item => item.text).join(' ');
    const words = allText.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Word frequency analysis
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, freq]) => ({ word, frequency: freq }));

    // Text statistics
    const stats = {
      totalWords: words.length,
      uniqueWords: Object.keys(wordFreq).length,
      averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      averageWordsPerText: words.length / data.length,
      readabilityScore: this.calculateReadabilityScore(allText),
    };

    return {
      success: true,
      analysisType: 'text_analysis',
      results: {
        statistics: stats,
        topWords: topWords,
        vocabularyRichness: parseFloat((stats.uniqueWords / stats.totalWords * 100).toFixed(2)),
        interpretation: this.interpretTextAnalysis(stats),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Helper methods
  private static calculatePercentile(sortedData: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
  }

  private static calculateSkewness(data: number[], mean: number, stdDev: number): number {
    const n = data.length;
    const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
    return skewness;
  }

  private static calculateKurtosis(data: number[], mean: number, stdDev: number): number {
    const n = data.length;
    const kurtosis = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
    return kurtosis;
  }

  private static interpretSkewness(skewness: number): string {
    if (Math.abs(skewness) < 0.5) return 'approximately symmetric';
    if (Math.abs(skewness) < 1) return 'moderately skewed';
    return 'highly skewed';
  }

  private static interpretKurtosis(kurtosis: number): string {
    if (kurtosis < -1) return 'platykurtic (flatter than normal)';
    if (kurtosis > 1) return 'leptokurtic (more peaked than normal)';
    return 'mesokurtic (normal distribution)';
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xVal, i) => acc + xVal * y[i], 0);
    const sumX2 = x.reduce((acc, xVal) => acc + xVal * xVal, 0);
    const sumY2 = y.reduce((acc, yVal) => acc + yVal * yVal, 0);

    return (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  }

  private static interpretCorrelationStrength(correlation: number): string {
    if (correlation > 0.8) return 'very strong';
    if (correlation > 0.6) return 'strong';
    if (correlation > 0.4) return 'moderate';
    if (correlation > 0.2) return 'weak';
    return 'very weak';
  }

  private static interpretCorrelation(correlation: number): string {
    const strength = this.interpretCorrelationStrength(Math.abs(correlation));
    const direction = correlation > 0 ? 'positive' : 'negative';
    return `There is a ${strength} ${direction} correlation between the variables.`;
  }

  private static generatePredictions(xValues: number[], slope: number, intercept: number): number[] {
    return xValues.map(x => slope * x + intercept);
  }

  private static interpretRegression(slope: number, rSquared: number): string {
    const direction = slope > 0 ? 'increases' : 'decreases';
    const strength = rSquared > 0.7 ? 'strong' : rSquared > 0.3 ? 'moderate' : 'weak';
    return `For every unit increase in x, y ${direction} by ${Math.abs(slope).toFixed(2)}. The model explains ${(rSquared * 100).toFixed(1)}% of the variance (${strength} fit).`;
  }

  // Additional helper methods for clustering, time series, etc.
  private static kMeansClustering(data: PointData[], k: number): Cluster[] {
    // Simplified k-means implementation
    const clusters: Cluster[] = Array.from({ length: k }, (_, i) => ({
      id: i,
      centroid: { x: Math.random() * 100, y: Math.random() * 100 },
      points: [],
    }));

    // Assign points to clusters (simplified)
    data.forEach(point => {
      const distances = clusters.map(cluster => 
        Math.sqrt(Math.pow(point.x - cluster.centroid.x, 2) + Math.pow(point.y - cluster.centroid.y, 2))
      );
      const closestCluster = distances.indexOf(Math.min(...distances));
      clusters[closestCluster].points.push(point);
    });

    return clusters;
  }

  private static calculateCentroid(points: PointData[]): PointData {
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    return {
      x: sumX / points.length,
      y: sumY / points.length,
    };
  }

  private static calculateSilhouetteScore(data: PointData[], clusters: Cluster[]): number {
    // Simplified silhouette score calculation
    return 0.5; // Placeholder
  }

  private static interpretClustering(silhouetteScore: number): string {
    if (silhouetteScore > 0.7) return 'Well-separated clusters';
    if (silhouetteScore > 0.5) return 'Reasonable cluster structure';
    if (silhouetteScore > 0.3) return 'Weak cluster structure';
    return 'No clear cluster structure';
  }

  private static clusteringRecommendations(clusters: Cluster[]): string[] {
    return [
      'Consider different numbers of clusters (k) for better results',
      'Visualize the clusters to validate the grouping',
      'Remove outliers before clustering for better results',
    ];
  }

  private static calculateTrend(values: number[]): { slope: number; direction: string } {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * values[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return { slope, direction: slope > 0 ? 'increasing' : 'decreasing' };
  }

  private static calculateSeasonality(values: number[]): { detected: boolean; period: number; strength: number } {
    // Simplified seasonality detection
    return { detected: false, period: 0, strength: 0 };
  }

  private static calculateMovingAverages(values: number[], window: number): number[] {
    const averages: number[] = [];
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      averages.push(sum / window);
    }
    return averages;
  }

  private static simpleForecast(values: number[], periods: number): number[] {
    const trend = this.calculateTrend(values);
    const lastValue = values[values.length - 1];
    const forecast: number[] = [];
    
    for (let i = 1; i <= periods; i++) {
      forecast.push(lastValue + trend.slope * i);
    }
    
    return forecast;
  }

  private static interpretTimeSeries(trend: any, seasonality: any): string {
    let interpretation = `The data shows a ${trend.direction} trend.`;
    if (seasonality.detected) {
      interpretation += ` There is also seasonal variation with a period of ${seasonality.period}.`;
    }
    return interpretation;
  }

  private static interpretAnomalies(outlierCount: number, totalCount: number): string {
    const percentage = (outlierCount / totalCount) * 100;
    if (percentage > 10) return 'High number of anomalies detected - investigate data quality';
    if (percentage > 5) return 'Moderate number of anomalies - review outliers';
    return 'Few anomalies detected - data appears clean';
  }

  private static anomalyRecommendations(outliers: number[], data: number[]): string[] {
    return [
      'Investigate the cause of outliers',
      'Consider removing outliers if they are data entry errors',
      'Use robust statistical methods if outliers are valid',
    ];
  }

  private static analyzeTextSentiment(text: string): { sentiment: string; score: number; confidence: number } {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'disappointed', 'sad', 'angry'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    const totalScore = positiveScore - negativeScore;
    let sentiment = 'neutral';
    if (totalScore > 0) sentiment = 'positive';
    else if (totalScore < 0) sentiment = 'negative';
    
    return {
      sentiment,
      score: totalScore,
      confidence: Math.abs(totalScore) / words.length,
    };
  }

  private static calculateOverallSentiment(sentiments: any[]): { sentiment: string; score: number } {
    const totalScore = sentiments.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScore / sentiments.length;
    
    let sentiment = 'neutral';
    if (averageScore > 0.1) sentiment = 'positive';
    else if (averageScore < -0.1) sentiment = 'negative';
    
    return { sentiment, score: averageScore };
  }

  private static interpretSentiment(overallSentiment: any): string {
    return `The overall sentiment is ${overallSentiment.sentiment} with a score of ${overallSentiment.score.toFixed(2)}.`;
  }

  private static calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  }

  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private static interpretTextAnalysis(stats: any): string {
    let interpretation = `The text contains ${stats.totalWords} words with ${stats.uniqueWords} unique words.`;
    interpretation += ` The vocabulary richness is ${(stats.uniqueWords / stats.totalWords * 100).toFixed(1)}%.`;
    
    if (stats.readabilityScore > 80) interpretation += ' The text is very easy to read.';
    else if (stats.readabilityScore > 60) interpretation += ' The text is easy to read.';
    else if (stats.readabilityScore > 40) interpretation += ' The text is moderately difficult to read.';
    else interpretation += ' The text is difficult to read.';
    
    return interpretation;
  }

  /**
   * Saves an analysis result to Firestore.
   * @param {string} userId The ID of the user who performed the analysis.
   * @param {AnalysisResult} analysisResult The analysis result to save.
   * @returns {Promise<string>} A promise that resolves with the ID of the newly created post.
   */
  static async saveAnalysisToFirestore(userId: string, analysisResult: AnalysisResult): Promise<string> {
    try {
      const postData = {
        type: 'data_analysis',
        title: `${analysisResult.analysisType} Analysis Results`,
        content: JSON.stringify(analysisResult.results, null, 2),
        metadata: {
          analysisType: analysisResult.analysisType,
          timestamp: analysisResult.timestamp,
          success: analysisResult.success,
        },
        visibility: 'private',
      };

      return await FirestoreService.createPost(userId, postData);
    } catch (error) {
      throw new Error(`Failed to save analysis to Firestore: ${error.message}`);
    }
  }
}

/**
 * The type of analysis to perform.
 */
export type AnalysisType = 
  | 'descriptive' 
  | 'correlation' 
  | 'regression' 
  | 'clustering' 
  | 'time_series' 
  | 'anomaly_detection' 
  | 'sentiment_analysis' 
  | 'text_analysis';

/**
 * The result of a data analysis.
 */
export interface AnalysisResult {
  success: boolean;
  analysisType: AnalysisType;
  results?: any;
  error?: string;
  timestamp: string;
}

/**
 * Data for a correlation analysis.
 */
export interface CorrelationData {
  x: number;
  y: number;
}

/**
 * Data for a point in a 2D space.
 */
export interface PointData {
  x: number;
  y: number;
}

/**
 * A cluster of points.
 */
export interface Cluster {
  id: number;
  centroid: PointData;
  points: PointData[];
}

/**
 * Data for a time series analysis.
 */
export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

/**
 * Data for a text analysis.
 */
export interface TextData {
  text: string;
  metadata?: any;
}

export default DataAnalysisTools;
