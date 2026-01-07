#!/bin/bash

# Bundle Size Analysis Script for ShapeShyft
# Analyzes the production build and provides size report

echo "🔍 Analyzing production bundle..."
echo ""

# Build the production bundle
echo "1️⃣  Building production bundle..."
bun run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "2️⃣  Analyzing bundle sizes..."
echo ""

# Check if dist directory exists
if [ ! -d "dist/assets" ]; then
    echo "❌ dist/assets directory not found!"
    exit 1
fi

# Get total dist size
TOTAL_SIZE=$(du -sh dist | awk '{print $1}')
echo "📦 Total dist size: $TOTAL_SIZE"
echo ""

# Analyze JavaScript chunks
echo "📊 JavaScript Chunks:"
echo "===================="
find dist/assets -name "*.js" -type f -exec ls -lh {} \; | awk '{printf "%-50s %10s\n", $9, $5}' | sed 's|dist/assets/||' | sort -k2 -h -r | head -20
echo ""

# Analyze CSS files
echo "🎨 CSS Files:"
echo "============="
find dist/assets -name "*.css" -type f -exec ls -lh {} \; | awk '{printf "%-50s %10s\n", $9, $5}' | sed 's|dist/assets/||' | sort -k2 -h -r
echo ""

# Count and size by chunk type
echo "📈 Summary by Chunk Type:"
echo "========================="

# Count vendor chunks
VENDOR_COUNT=$(find dist/assets -name "vendor-*.js" | wc -l)
VENDOR_SIZE=$(find dist/assets -name "vendor-*.js" -exec du -ch {} + | grep total | awk '{print $1}')
echo "Vendor chunks: $VENDOR_COUNT files, $VENDOR_SIZE total"

# Count page chunks
PAGE_COUNT=$(find dist/assets -name "page-*.js" | wc -l)
PAGE_SIZE=$(find dist/assets -name "page-*.js" -exec du -ch {} + 2>/dev/null | grep total | awk '{print $1}')
echo "Page chunks: $PAGE_COUNT files, ${PAGE_SIZE:-0K} total"

# Count React chunks
REACT_COUNT=$(find dist/assets -name "*react*.js" | wc -l)
REACT_SIZE=$(find dist/assets -name "*react*.js" -exec du -ch {} + | grep total | awk '{print $1}')
echo "React chunks: $REACT_COUNT files, $REACT_SIZE total"

# Count application chunks
APP_COUNT=$(find dist/assets -name "*.js" ! -name "vendor-*" ! -name "page-*" ! -name "*react*" ! -name "index-*" | wc -l)
APP_SIZE=$(find dist/assets -name "*.js" ! -name "vendor-*" ! -name "page-*" ! -name "*react*" ! -name "index-*" -exec du -ch {} + 2>/dev/null | grep total | awk '{print $1}')
echo "App chunks: $APP_COUNT files, ${APP_SIZE:-0K} total"

echo ""
echo "✅ Analysis complete!"
echo ""
echo "💡 Optimization Tips:"
echo "  - Chunks > 250KB should be split further"
echo "  - Pages are lazy-loaded on demand"
echo "  - Critical path should be < 150KB total"
