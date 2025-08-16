'use client';

export default function ColorTest() {
  return (
    <div className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
      <h3 className="text-sm font-bold mb-2">Color Test</h3>
      
      {/* Test different color approaches */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>text-primary:</span>
          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <span>text-orange-500:</span>
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Direct CSS:</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#C2410C' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <span>CSS Variable:</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'hsl(var(--primary))' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <span>CSS Var Raw:</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        
        {/* Show computed CSS variable values */}
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          <div>CSS Variables:</div>
          <div id="css-vars"></div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            const primary = getComputedStyle(root).getPropertyValue('--primary');
            const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary');
            const varsDiv = document.getElementById('css-vars');
            if (varsDiv) {
              varsDiv.innerHTML = 
                '--primary: ' + primary + '<br>' +
                '--brand-primary: ' + brandPrimary;
            }
          }
        `
      }} />
    </div>
  );
}