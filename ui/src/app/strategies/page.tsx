import Link from 'next/link';

export default function StrategiesPage() {
  // Example strategies - in a real app, these would come from an API
  const strategies = [
    {
      id: '1',
      name: 'Simple Moving Average Crossover',
      description: 'A strategy that generates signals based on the crossover of two moving averages.',
      lastModified: '2023-05-15',
      performance: { winRate: '58%', profitFactor: 1.75, drawdown: '12%' },
      tags: ['trend-following', 'beginner']
    },
    {
      id: '2',
      name: 'RSI Divergence',
      description: 'Identifies potential reversals by detecting divergences between price and RSI indicator.',
      lastModified: '2023-06-02',
      performance: { winRate: '62%', profitFactor: 2.1, drawdown: '15%' },
      tags: ['reversal', 'oscillator', 'intermediate']
    },
    {
      id: '3',
      name: 'MACD Histogram Strategy',
      description: 'Uses MACD histogram changes to identify momentum shifts and generate entry signals.',
      lastModified: '2023-06-10',
      performance: { winRate: '54%', profitFactor: 1.5, drawdown: '10%' },
      tags: ['momentum', 'intermediate']
    },
    {
      id: '4',
      name: 'Bollinger Bands Squeeze',
      description: 'Identifies volatility contractions and subsequent breakouts using Bollinger Bands.',
      lastModified: '2023-06-20',
      performance: { winRate: '51%', profitFactor: 1.8, drawdown: '18%' },
      tags: ['volatility', 'breakout', 'advanced']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-3xl font-bold">Trading Strategies</h1>
        <Link href="/strategies/new" className="btn btn-primary">
          Create New Strategy
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search strategies..."
            className="input flex-1"
          />
          <select className="select w-auto">
            <option value="">All Tags</option>
            <option value="trend-following">Trend Following</option>
            <option value="reversal">Reversal</option>
            <option value="momentum">Momentum</option>
            <option value="volatility">Volatility</option>
          </select>
          <select className="select w-auto">
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="date">Date Modified</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex-between mb-2">
              <h2 className="text-xl font-semibold m-0">{strategy.name}</h2>
              <div className="flex space-x-2">
                <Link href={`/strategies/${strategy.id}/analyze`} className="text-primary-600 hover:text-primary-800">
                  <span className="sr-only">Analyze</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href={`/strategies/${strategy.id}/edit`} className="text-secondary-600 hover:text-secondary-800">
                  <span className="sr-only">Edit</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </Link>
              </div>
            </div>
            <p className="text-secondary-600 mb-4">{strategy.description}</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-secondary-50 p-2 rounded">
                <div className="text-xs text-secondary-500">Win Rate</div>
                <div className="font-medium">{strategy.performance.winRate}</div>
              </div>
              <div className="bg-secondary-50 p-2 rounded">
                <div className="text-xs text-secondary-500">Profit Factor</div>
                <div className="font-medium">{strategy.performance.profitFactor}</div>
              </div>
              <div className="bg-secondary-50 p-2 rounded">
                <div className="text-xs text-secondary-500">Drawdown</div>
                <div className="font-medium">{strategy.performance.drawdown}</div>
              </div>
            </div>
            <div className="flex-between">
              <div className="flex flex-wrap gap-2">
                {strategy.tags.map((tag) => (
                  <span key={tag} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-secondary-500">
                Last modified: {strategy.lastModified}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow">
          <a href="#" className="px-4 py-2 bg-white border border-secondary-300 text-secondary-500 rounded-l-md hover:bg-secondary-50">
            Previous
          </a>
          <a href="#" className="px-4 py-2 bg-primary-600 text-white border border-primary-600">
            1
          </a>
          <a href="#" className="px-4 py-2 bg-white border border-secondary-300 text-secondary-500 hover:bg-secondary-50">
            2
          </a>
          <a href="#" className="px-4 py-2 bg-white border border-secondary-300 text-secondary-500 rounded-r-md hover:bg-secondary-50">
            Next
          </a>
        </nav>
      </div>
    </div>
  );
} 