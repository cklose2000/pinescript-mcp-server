import Link from 'next/link';

export default function AnalyzePage() {
  return (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-3xl font-bold">Strategy Analysis</h1>
        <div className="flex space-x-3">
          <Link href="/analyze/history" className="btn btn-secondary">
            Analysis History
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Strategy Code</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Enter your PineScript strategy:
              </label>
              <div className="border border-secondary-300 rounded-md overflow-hidden">
                <div className="bg-secondary-100 px-4 py-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Pine Script</span>
                  <div className="flex space-x-2">
                    <button className="text-secondary-600 hover:text-secondary-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                        <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                      </svg>
                    </button>
                    <button className="text-secondary-600 hover:text-secondary-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <textarea 
                  className="w-full h-64 p-4 font-mono text-sm focus:outline-none" 
                  placeholder="// Paste your PineScript strategy here
// Example:
strategy('Simple MA Crossover', overlay=true)
fastLength = input(10, 'Fast MA Length')
slowLength = input(30, 'Slow MA Length')
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

if (longCondition)
    strategy.entry('Long', strategy.long)
if (shortCondition)
    strategy.entry('Short', strategy.short)"
                ></textarea>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Or select an existing strategy:
              </label>
              <select className="select">
                <option value="">Select a strategy</option>
                <option value="1">Simple Moving Average Crossover</option>
                <option value="2">RSI Divergence</option>
                <option value="3">MACD Histogram Strategy</option>
                <option value="4">Bollinger Bands Squeeze</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Backtest Results (Optional)</h2>
            <p className="text-secondary-600 mb-4">
              Including backtest results allows for more comprehensive analysis.
            </p>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <button className="btn btn-secondary text-sm">Upload JSON</button>
                <span className="text-sm text-secondary-500">or</span>
                <button className="btn btn-secondary text-sm">Paste Results</button>
              </div>
              <div className="border border-dashed border-secondary-300 rounded-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-secondary-600">
                  Drop your backtest results file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-secondary-500">
                  Supports JSON format exported from TradingView
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Analysis Options</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Analysis Type
              </label>
              <div className="space-y-2">
                <label className="flex items-start p-3 border border-secondary-200 rounded-md hover:bg-secondary-50">
                  <input type="radio" name="analysisType" className="mt-1" defaultChecked />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">Strategy Analysis</span>
                    <span className="block text-xs text-secondary-500">Evaluate code structure, logic, and risk management</span>
                  </div>
                </label>
                <label className="flex items-start p-3 border border-secondary-200 rounded-md hover:bg-secondary-50">
                  <input type="radio" name="analysisType" className="mt-1" />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">Backtest Analysis</span>
                    <span className="block text-xs text-secondary-500">Evaluate performance metrics and results</span>
                  </div>
                </label>
                <label className="flex items-start p-3 border border-secondary-200 rounded-md hover:bg-secondary-50">
                  <input type="radio" name="analysisType" className="mt-1" />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">Strategy Optimization</span>
                    <span className="block text-xs text-secondary-500">Suggest parameter improvements based on backtest</span>
                  </div>
                </label>
                <label className="flex items-start p-3 border border-secondary-200 rounded-md hover:bg-secondary-50">
                  <input type="radio" name="analysisType" className="mt-1" />
                  <div className="ml-3">
                    <span className="block text-sm font-medium">Strategy Enhancement</span>
                    <span className="block text-xs text-secondary-500">Generate improved version with better risk management</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Template
              </label>
              <select className="select">
                <option value="default">Default Strategy Analysis</option>
                <option value="detailed">Detailed Analysis with Code Review</option>
                <option value="beginner">Beginner-Friendly Explanation</option>
                <option value="advanced">Advanced Performance Analysis</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                LLM Provider
              </label>
              <select className="select">
                <option value="openai">OpenAI (Default)</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="mock">Mock Provider (Testing)</option>
              </select>
            </div>
          </div>

          <div className="card bg-primary-50 border border-primary-200">
            <h2 className="text-xl font-semibold text-primary-800 mb-4">Analysis Summary</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex-between">
                <span className="text-secondary-600">Analysis Type:</span>
                <span className="font-medium">Strategy Analysis</span>
              </li>
              <li className="flex-between">
                <span className="text-secondary-600">Template:</span>
                <span className="font-medium">Default Strategy Analysis</span>
              </li>
              <li className="flex-between">
                <span className="text-secondary-600">Provider:</span>
                <span className="font-medium">OpenAI</span>
              </li>
              <li className="flex-between">
                <span className="text-secondary-600">Backtest Data:</span>
                <span className="font-medium text-secondary-500">Not included</span>
              </li>
            </ul>
            <div className="mt-6">
              <button className="btn btn-primary w-full">
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 