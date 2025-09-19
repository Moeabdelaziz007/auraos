// Free AI Tools Integration for AuraOS
// Zero-cost AI capabilities using open-source and free APIs

import axios from 'axios';
import { FirestoreService } from '../client/src/lib/firebase';

export class FreeAITools {
  private static readonly FREE_APIS = {
    // Free text analysis APIs
    HUGGINGFACE_API: 'https://api-inference.huggingface.co/models',
    OPENAI_FREE: 'https://api.openai.com/v1', // Free tier available
    GEMINI_FREE: 'https://generativelanguage.googleapis.com/v1beta',
    
    // Free translation APIs
    LIBRE_TRANSLATE: 'https://libretranslate.de/translate',
    MYMEMORY_TRANSLATE: 'https://api.mymemory.translated.net/get',
    
    // Free image processing
    UPLOAD_IMAGE: 'https://api.imgbb.com/1/upload',
    
    // Free web scraping
    SCRAPING_BEE: 'https://app.scrapingbee.com/api/v1',
  };

  /**
   * Free Text Analysis using Hugging Face Inference API
   */
  static async analyzeText(text: string, analysisType: 'sentiment' | 'emotion' | 'keywords' | 'summary'): Promise<any> {
    try {
      let model = '';
      switch (analysisType) {
        case 'sentiment':
          model = 'cardiffnlp/twitter-roberta-base-sentiment-latest';
          break;
        case 'emotion':
          model = 'j-hartmann/emotion-english-distilroberta-base';
          break;
        case 'keywords':
          model = 'dbmdz/bert-large-cased-finetuned-pubmed';
          break;
        case 'summary':
          model = 'facebook/bart-large-cnn';
          break;
      }

      const response = await axios.post(
        `${this.FREE_APIS.HUGGINGFACE_API}/${model}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_your_free_token'}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        analysisType,
        result: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: await this.fallbackTextAnalysis(text, analysisType),
      };
    }
  }

  /**
   * Fallback text analysis using simple algorithms
   */
  private static async fallbackTextAnalysis(text: string, analysisType: string): Promise<any> {
    switch (analysisType) {
      case 'sentiment':
        return this.simpleSentimentAnalysis(text);
      case 'keywords':
        return this.simpleKeywordExtraction(text);
      case 'summary':
        return this.simpleSummarization(text);
      default:
        return { message: 'Fallback analysis not available for this type' };
    }
  }

  private static simpleSentimentAnalysis(text: string): any {
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
      confidence: Math.abs(totalScore) / words.length,
      positiveScore,
      negativeScore,
    };
  }

  private static simpleKeywordExtraction(text: string): any {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, freq]) => ({ word, frequency: freq }));
    
    return { keywords };
  }

  private static simpleSummarization(text: string): any {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.3));
    const summary = sentences.slice(0, summaryLength).join('. ') + '.';
    
    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: (summary.length / text.length) * 100,
    };
  }

  /**
   * Free Translation using LibreTranslate
   */
  static async translateText(text: string, targetLang: string, sourceLang = 'auto'): Promise<any> {
    try {
      const response = await axios.post(this.FREE_APIS.LIBRE_TRANSLATE, {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      });

      return {
        success: true,
        originalText: text,
        translatedText: response.data.translatedText,
        sourceLanguage: response.data.detectedLanguage?.language || sourceLang,
        targetLanguage: targetLang,
        confidence: response.data.detectedLanguage?.confidence || 1,
      };
    } catch (error) {
      // Fallback to MyMemory API
      try {
        const fallbackResponse = await axios.get(this.FREE_APIS.MYMEMORY_TRANSLATE, {
          params: {
            q: text,
            langpair: `${sourceLang}|${targetLang}`,
          },
        });

        return {
          success: true,
          originalText: text,
          translatedText: fallbackResponse.data.responseData.translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          provider: 'MyMemory',
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: fallbackError.message,
          fallback: this.simpleTranslation(text, targetLang),
        };
      }
    }
  }

  private static simpleTranslation(text: string, targetLang: string): any {
    // Simple translation mapping (very basic)
    const translations: { [key: string]: { [key: string]: string } } = {
      'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao' },
      'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', it: 'arrivederci' },
      'thank you': { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie' },
    };

    const lowerText = text.toLowerCase();
    for (const [english, translations] of Object.entries(translations)) {
      if (lowerText.includes(english) && translations[targetLang]) {
        return {
          originalText: text,
          translatedText: text.replace(new RegExp(english, 'gi'), translations[targetLang]),
          provider: 'Simple Dictionary',
        };
      }
    }

    return {
      originalText: text,
      translatedText: `[Translation to ${targetLang}] ${text}`,
      provider: 'Placeholder',
    };
  }

  /**
   * Free Image Processing using free APIs
   */
  static async processImage(imageUrl: string, operation: 'analyze' | 'resize' | 'filter'): Promise<any> {
    try {
      switch (operation) {
        case 'analyze':
          return await this.analyzeImage(imageUrl);
        case 'resize':
          return await this.resizeImage(imageUrl);
        case 'filter':
          return await this.applyFilter(imageUrl);
        default:
          throw new Error(`Unknown image operation: ${operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private static async analyzeImage(imageUrl: string): Promise<any> {
    // Using free image analysis APIs
    try {
      // This would integrate with free image analysis services
      return {
        success: true,
        operation: 'analyze',
        results: {
          colors: ['#FF5733', '#33FF57', '#3357FF'],
          objects: ['person', 'car', 'building'],
          text: 'Sample extracted text',
          confidence: 0.85,
        },
        note: 'This is a placeholder. Integrate with free image analysis APIs.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private static async resizeImage(imageUrl: string): Promise<any> {
    // Simple image resizing using free services
    return {
      success: true,
      operation: 'resize',
      results: {
        originalUrl: imageUrl,
        resizedUrl: `${imageUrl}?w=300&h=200`,
        dimensions: { width: 300, height: 200 },
      },
      note: 'This is a placeholder. Integrate with free image resizing services.',
    };
  }

  private static async applyFilter(imageUrl: string): Promise<any> {
    // Apply filters using free image processing
    return {
      success: true,
      operation: 'filter',
      results: {
        originalUrl: imageUrl,
        filteredUrl: `${imageUrl}?filter=grayscale`,
        filter: 'grayscale',
      },
      note: 'This is a placeholder. Integrate with free image filtering services.',
    };
  }

  /**
   * Free Web Scraping
   */
  static async scrapeWebsite(url: string, options: { extractText?: boolean; selectors?: string[] } = {}): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      let extractedData = response.data;

      if (options.extractText) {
        // Simple HTML to text conversion
        extractedData = response.data
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<style[^>]*>.*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      return {
        success: true,
        url,
        data: extractedData,
        contentType: response.headers['content-type'],
        length: extractedData.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url,
      };
    }
  }

  /**
   * Free Data Analysis
   */
  static async analyzeData(data: any[], analysisType: 'statistics' | 'trends' | 'correlations' | 'outliers'): Promise<any> {
    try {
      switch (analysisType) {
        case 'statistics':
          return this.calculateStatistics(data);
        case 'trends':
          return this.analyzeTrends(data);
        case 'correlations':
          return this.findCorrelations(data);
        case 'outliers':
          return this.detectOutliers(data);
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private static calculateStatistics(data: number[]): any {
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return {
      success: true,
      analysisType: 'statistics',
      results: {
        count: data.length,
        sum,
        mean: parseFloat(mean.toFixed(2)),
        median,
        min: Math.min(...data),
        max: Math.max(...data),
        variance: parseFloat(variance.toFixed(2)),
        standardDeviation: parseFloat(stdDev.toFixed(2)),
        range: Math.max(...data) - Math.min(...data),
      },
    };
  }

  private static analyzeTrends(data: number[]): any {
    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = data;

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      success: true,
      analysisType: 'trends',
      results: {
        slope: parseFloat(slope.toFixed(4)),
        intercept: parseFloat(intercept.toFixed(4)),
        trend: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable',
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        rSquared: this.calculateRSquared(xValues, yValues, slope, intercept),
      },
    };
  }

  private static findCorrelations(data: any[]): any {
    if (data.length < 2) {
      return { success: false, error: 'Need at least 2 data points for correlation analysis' };
    }

    // Assuming data is array of objects with x and y properties
    const xValues = data.map(d => d.x || d[0]);
    const yValues = data.map(d => d.y || d[1]);

    const correlation = this.calculateCorrelation(xValues, yValues);

    return {
      success: true,
      analysisType: 'correlations',
      results: {
        correlationCoefficient: parseFloat(correlation.toFixed(4)),
        strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                 Math.abs(correlation) > 0.3 ? 'moderate' : 'weak',
        direction: correlation > 0 ? 'positive' : 'negative',
        interpretation: this.interpretCorrelation(correlation),
      },
    };
  }

  private static detectOutliers(data: number[]): any {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outliers = data.filter(x => x < lowerBound || x > upperBound);

    return {
      success: true,
      analysisType: 'outliers',
      results: {
        outliers,
        outlierCount: outliers.length,
        outlierPercentage: parseFloat(((outliers.length / data.length) * 100).toFixed(2)),
        bounds: {
          lower: parseFloat(lowerBound.toFixed(2)),
          upper: parseFloat(upperBound.toFixed(2)),
        },
        quartiles: {
          q1: parseFloat(q1.toFixed(2)),
          q3: parseFloat(q3.toFixed(2)),
          iqr: parseFloat(iqr.toFixed(2)),
        },
      },
    };
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

  private static calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssRes = y.reduce((acc, yVal, i) => acc + Math.pow(yVal - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((acc, yVal) => acc + Math.pow(yVal - yMean, 2), 0);
    
    return parseFloat((1 - ssRes / ssTot).toFixed(4));
  }

  private static interpretCorrelation(correlation: number): string {
    const abs = Math.abs(correlation);
    if (abs > 0.8) return 'Very strong correlation';
    if (abs > 0.6) return 'Strong correlation';
    if (abs > 0.4) return 'Moderate correlation';
    if (abs > 0.2) return 'Weak correlation';
    return 'Very weak or no correlation';
  }

  /**
   * Free Code Generation
   */
  static async generateCode(language: string, description: string, template: string): Promise<any> {
    try {
      const codeTemplates = {
        javascript: {
          function: `function ${this.camelCase(description)}() {\n  // ${description}\n  return null;\n}`,
          component: `const ${this.pascalCase(description)} = () => {\n  return (\n    <div>\n      {/* ${description} */}\n    </div>\n  );\n};`,
          api: `app.get('/${this.kebabCase(description)}', (req, res) => {\n  // ${description}\n  res.json({ message: 'Success' });\n});`,
        },
        python: {
          function: `def ${this.snakeCase(description)}():\n    """${description}"""\n    pass`,
          class: `class ${this.pascalCase(description)}:\n    def __init__(self):\n        """${description}"""\n        pass`,
          api: `@app.route('/${this.kebabCase(description)}', methods=['GET'])\ndef ${this.snakeCase(description)}():\n    # ${description}\n    return jsonify({'message': 'Success'})`,
        },
      };

      const code = codeTemplates[language]?.[template] || `// ${description} in ${language}`;

      return {
        success: true,
        language,
        template,
        description,
        code,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Utility functions for code generation
  private static camelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private static pascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private static snakeCase(str: string): string {
    return str.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  }

  private static kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Save analysis results to Firestore
   */
  static async saveAnalysisToFirestore(userId: string, analysisType: string, results: any): Promise<string> {
    try {
      const analysisData = {
        type: analysisType,
        results,
        userId,
        createdAt: new Date(),
        metadata: {
          tool: 'FreeAITools',
          version: '1.0.0',
        },
      };

      return await FirestoreService.createPost(userId, analysisData);
    } catch (error) {
      throw new Error(`Failed to save analysis to Firestore: ${error.message}`);
    }
  }
}

export default FreeAITools;
