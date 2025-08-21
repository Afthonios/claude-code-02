# Test Sequence for Course Type Filtering

## Steps to reproduce the issue:

1. **Navigate to**: http://localhost:3004/fr/courses
2. **Open browser console** to see debugging logs
3. **Click "Formation"** checkbox
   - Expected: Only Formation courses should show
   - Check console for: `🔍 [Filter] courseType: ['Formation']`
4. **Immediately click "Parcours"** checkbox
   - Expected: Formation should uncheck, only Parcours courses should show
   - Check console for: `🔍 [Filter] courseType: ['Parcours']`

## Expected behavior:
- Only one course type can be selected at a time
- Switching from Formation to Parcours should immediately show Parcours courses
- Should never show "Aucune formation trouvée" when switching between valid options

## Debug logs to watch:
- `🔄 Filter change for` - Shows checkbox interactions
- `🔄 [handleFilterChange]` - Shows filter state being passed to hook
- `🔄 [setFilters]` - Shows hook receiving and processing filters
- `🔍 [Filter] courseType` - Shows final filter being applied
- `🔍 [Client] Filtering` - Shows client-side filtering results

## Issue to fix:
If we see both Formation AND Parcours in the courseType array at the same time, that's the race condition causing "no results found".