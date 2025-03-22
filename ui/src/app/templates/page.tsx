import Link from 'next/link';

export default function TemplatesPage() {
  // Example templates - in a real app, these would come from an API
  const templates = [
    {
      id: '1',
      name: 'Strategy Analysis',
      description: 'Analyzes trading strategy code to identify strengths, weaknesses, and potential improvements.',
      category: 'Analysis',
      lastUpdated: '2023-05-10',
      usageCount: 246,
      tags: ['analysis', 'review']
    },
    {
      id: '2',
      name: 'Backtest Interpretation',
      description: 'Evaluates backtest results to identify performance patterns, concerns, and optimization opportunities.',
      category: 'Analysis',
      lastUpdated: '2023-05-15',
      usageCount: 189,
      tags: ['backtest', 'performance']
    },
    {
      id: '3',
      name: 'Strategy Optimization',
      description: 'Suggests parameter optimizations based on strategy code and backtest results.',
      category: 'Optimization',
      lastUpdated: '2023-06-01',
      usageCount: 157,
      tags: ['parameters', 'optimization']
    },
    {
      id: '4',
      name: 'Strategy Enhancement',
      description: 'Generates improvements to trading logic, risk management, and overall strategy design.',
      category: 'Enhancement',
      lastUpdated: '2023-06-10',
      usageCount: 134,
      tags: ['enhancement', 'improvement']
    },
    {
      id: '5',
      name: 'Educational Explanation',
      description: 'Provides educational explanations of trading concepts and strategy components.',
      category: 'Education',
      lastUpdated: '2023-06-15',
      usageCount: 112,
      tags: ['education', 'explanation']
    },
    {
      id: '6',
      name: 'Market Regime Detection',
      description: 'Analyzes price action and indicators to identify current market regimes and conditions.',
      category: 'Analysis',
      lastUpdated: '2023-06-20',
      usageCount: 95,
      tags: ['market', 'regime', 'conditions']
    }
  ];

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    acc[template.category] = acc[template.category] || [];
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <h1 className="text-3xl font-bold">Prompt Templates</h1>
        <div className="flex space-x-3">
          <Link href="/templates/search" className="btn btn-secondary">
            Search Templates
          </Link>
          <Link href="/templates/new" className="btn btn-primary">
            Create Template
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Filter templates..."
            className="input flex-1"
          />
          <select className="select w-auto">
            <option value="">All Categories</option>
            <option value="Analysis">Analysis</option>
            <option value="Optimization">Optimization</option>
            <option value="Enhancement">Enhancement</option>
            <option value="Education">Education</option>
          </select>
          <select className="select w-auto">
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="updated">Last Updated</option>
            <option value="usage">Usage</option>
          </select>
        </div>
      </div>

      {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-semibold">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTemplates.map((template) => (
              <div key={template.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex-between mb-2">
                  <h3 className="text-xl font-semibold m-0">{template.name}</h3>
                  <div className="flex space-x-2">
                    <Link href={`/templates/${template.id}`} className="text-primary-600 hover:text-primary-800">
                      <span className="sr-only">View</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    <Link href={`/templates/${template.id}/edit`} className="text-secondary-600 hover:text-secondary-800">
                      <span className="sr-only">Edit</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                  </div>
                </div>
                <p className="text-secondary-600 mb-4">{template.description}</p>
                <div className="flex-between mb-4">
                  <div className="bg-secondary-50 px-3 py-1 rounded text-sm">
                    <span className="font-medium">{template.usageCount}</span> uses
                  </div>
                  <div className="text-sm text-secondary-500">
                    Last updated: {template.lastUpdated}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span key={tag} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-secondary-50 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Template Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/templates/sync" className="card hover:shadow-lg transition-shadow text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <h3 className="font-medium">Sync Templates</h3>
            <p className="text-sm text-secondary-600">Synchronize templates with database</p>
          </Link>
          <Link href="/templates/embed" className="card hover:shadow-lg transition-shadow text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h3 className="font-medium">Embed Templates</h3>
            <p className="text-sm text-secondary-600">Generate vector embeddings for search</p>
          </Link>
          <Link href="/templates/versions" className="card hover:shadow-lg transition-shadow text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary-600 mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <h3 className="font-medium">Template Versions</h3>
            <p className="text-sm text-secondary-600">View and manage template history</p>
          </Link>
        </div>
      </div>
    </div>
  );
} 