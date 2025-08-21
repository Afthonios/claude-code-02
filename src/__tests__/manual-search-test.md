# Manual Search Functionality Test

## Steps to Test Search Overlay

1. **Open the app** at http://localhost:3001/fr/cours
2. **Click the search icon** in the header (magnifying glass)
3. **Verify overlay opens** - should see a centered search box with backdrop
4. **Type a search query** (e.g., "javascript")
5. **Press Enter** or click search
6. **Check URL** - should navigate to `/fr/cours?search=javascript`
7. **Verify results** - courses should be filtered based on search

## Expected Behavior

### Search Icon in Header
- ✅ Should be visible in header between navigation and language switcher
- ✅ Should have proper hover states
- ✅ Should have accessibility labels

### Search Overlay
- ✅ Should open when search icon is clicked
- ✅ Should have dark backdrop
- ✅ Should center the search box
- ✅ Should focus the input field when opened
- ✅ Should close on Escape key
- ✅ Should close when clicking outside

### Search Functionality
- ✅ Should navigate to courses page with search parameter
- ✅ Should encode special characters in URL
- ✅ Should trim whitespace
- ✅ Should not submit empty searches
- ✅ Should close overlay after successful search

### Course Filtering
- ✅ Should pick up search parameter from URL
- ✅ Should filter courses based on search query
- ✅ Should show results count
- ✅ Should handle no results gracefully

## Common Issues to Check

1. **JavaScript/TypeScript Errors**
   - Check browser console for errors
   - Verify all imports are correct
   - Check for missing dependencies

2. **CSS/Styling Issues**
   - Check if overlay is visible (z-index issues)
   - Verify backdrop is clickable
   - Check animations are working

3. **Navigation Issues**
   - Verify router.push is working
   - Check URL generation is correct
   - Verify locale handling

4. **State Management**
   - Check if search state is updating
   - Verify overlay open/close state
   - Check form submission

5. **API/Data Issues**
   - Verify courses are loading
   - Check search filtering logic
   - Verify API calls are working

## Debug Commands

```bash
# Check for console errors
# Open browser dev tools → Console

# Check network requests
# Open browser dev tools → Network

# Test URL manually
http://localhost:3001/fr/cours?search=test

# Check if search parameter is picked up
# Look at the search input in the courses page filter bar
```

## Fix Checklist

- [ ] Search overlay opens and closes properly
- [ ] Search input accepts text and focuses correctly
- [ ] Form submission triggers navigation
- [ ] URL is generated correctly with search parameter
- [ ] Courses page picks up search parameter
- [ ] Course results are filtered based on search
- [ ] All error states are handled gracefully