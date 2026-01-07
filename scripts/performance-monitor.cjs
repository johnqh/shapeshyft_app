#!/usr/bin/env node

/**
 * Performance Monitor for ShapeShyft
 * Provides detailed bundle analysis, Core Web Vitals estimation, and optimization recommendations
 */

const fs = require("fs");
const path = require("path");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bright: "\x1b[1m",
};

// Performance budgets (in bytes)
const BUDGETS = {
  criticalPath: 51200, // 50KB
  totalJS: 204800, // 200KB
  totalCSS: 51200, // 50KB
  image: 102400, // 100KB per image
  font: 51200, // 50KB per font
};

// Connection speeds (Kbps)
const CONNECTION_SPEEDS = {
  "Slow 3G": 400,
  "Fast 3G": 1600,
  "4G": 9000,
  Cable: 25000,
  Fiber: 100000,
};

class PerformanceAnalyzer {
  constructor() {
    this.distPath = path.join(process.cwd(), "dist");
    this.results = {
      criticalPath: { uncompressed: 0, gzip: 0, brotli: 0 },
      totalBundles: { js: 0, css: 0, assets: 0 },
      files: [],
      recommendations: [],
      scores: {},
    };
  }

  // Utility function to format bytes
  formatBytes(bytes) {
    if (bytes === 0) return "0B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  }

  // Utility function to format time
  formatTime(seconds) {
    if (seconds >= 1) {
      return `${seconds.toFixed(2)}s`;
    }
    return `${Math.round(seconds * 1000)}ms`;
  }

  // Calculate load time based on file size and connection speed
  calculateLoadTime(sizeBytes, speedKbps) {
    const sizeKilobits = (sizeBytes * 8) / 1000;
    return sizeKilobits / speedKbps;
  }

  // Get file size safely
  getFileSize(filePath) {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  // Find files matching pattern
  findFiles(pattern) {
    try {
      const assetsDir = path.join(this.distPath, "assets");
      if (!fs.existsSync(assetsDir)) return [];

      const files = fs.readdirSync(assetsDir);
      return files
        .filter((file) => file.match(pattern))
        .map((file) => path.join(assetsDir, file));
    } catch {
      return [];
    }
  }

  // Analyze critical path files
  analyzeCriticalPath() {
    console.log(`${colors.blue}📊 Critical Path Analysis${colors.reset}`);
    console.log("=".repeat(50));

    const criticalPatterns = [
      { name: "HTML", files: [path.join(this.distPath, "index.html")] },
      { name: "Main CSS", files: this.findFiles(/^index-.*\.css$/) },
      { name: "Main JS", files: this.findFiles(/^index-.*\.js$/) },
    ];

    console.log(
      `${"File Type".padEnd(20)} ${"Original".padStart(12)} ${"Gzip Est.".padStart(12)}`,
    );
    console.log("-".repeat(56));

    let totalUncompressed = 0;
    let totalGzip = 0;

    criticalPatterns.forEach((pattern) => {
      let patternUncompressed = 0;
      let patternGzip = 0;

      pattern.files.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          const uncompressed = this.getFileSize(filePath);
          // Use actual gzip compression ratios: CSS ~13%, JS ~30%, HTML ~25%
          const ext = path.extname(filePath);
          const gzipRatio = ext === ".css" ? 0.13 : ext === ".js" ? 0.32 : 0.25;
          const gzip = Math.round(uncompressed * gzipRatio);

          patternUncompressed += uncompressed;
          patternGzip += gzip;

          this.results.files.push({
            path: filePath,
            type: pattern.name.toLowerCase(),
            uncompressed,
            gzip,
          });
        }
      });

      if (patternUncompressed > 0) {
        console.log(
          `${pattern.name.padEnd(20)} ${this.formatBytes(patternUncompressed).padStart(12)} ${this.formatBytes(patternGzip).padStart(12)}`,
        );
      }

      totalUncompressed += patternUncompressed;
      totalGzip += patternGzip;
    });

    console.log("-".repeat(56));
    console.log(
      `${"TOTAL CRITICAL".padEnd(20)} ${this.formatBytes(totalUncompressed).padStart(12)} ${this.formatBytes(totalGzip).padStart(12)}`,
    );

    this.results.criticalPath = {
      uncompressed: totalUncompressed,
      gzip: totalGzip,
      brotli: Math.round(totalGzip * 0.85), // Brotli ~15% better than gzip
    };

    // Performance rating
    let rating, color;
    const effectiveSize = this.results.criticalPath.gzip;
    if (effectiveSize <= 51200) {
      rating = "🟢 Excellent";
      color = colors.green;
    } else if (effectiveSize <= 102400) {
      rating = "🟡 Good";
      color = colors.yellow;
    } else if (effectiveSize <= 204800) {
      rating = "🟠 Fair";
      color = colors.yellow;
    } else {
      rating = "🔴 Needs Optimization";
      color = colors.red;
    }

    console.log(`\nPerformance Rating: ${color}${rating}${colors.reset}\n`);
    this.results.scores.performance = rating;
  }

  // Analyze load times
  analyzeLoadTimes() {
    console.log(`${colors.blue}⚡ Load Time Analysis${colors.reset}`);
    console.log("=".repeat(50));

    console.log(
      `${"Connection".padEnd(15)} ${"Uncompressed".padStart(15)} ${"Gzip Est.".padStart(15)}`,
    );
    console.log("-".repeat(60));

    Object.entries(CONNECTION_SPEEDS).forEach(([connection, speed]) => {
      const timeUncompressed = this.calculateLoadTime(
        this.results.criticalPath.uncompressed,
        speed,
      );
      const timeGzip = this.calculateLoadTime(
        this.results.criticalPath.gzip,
        speed,
      );

      console.log(
        `${connection.padEnd(15)} ${this.formatTime(timeUncompressed).padStart(15)} ${this.formatTime(timeGzip).padStart(15)}`,
      );
    });
    console.log("");
  }

  // Analyze all bundles
  analyzeBundles() {
    console.log(`${colors.cyan}📦 Bundle Analysis${colors.reset}`);
    console.log("=".repeat(50));

    // Get all JS files
    const jsFiles = this.findFiles(/\.js$/);
    const totalJS = jsFiles.reduce(
      (sum, file) => sum + this.getFileSize(file),
      0,
    );

    // Get all CSS files
    const cssFiles = this.findFiles(/\.css$/);
    const totalCSS = cssFiles.reduce(
      (sum, file) => sum + this.getFileSize(file),
      0,
    );

    this.results.totalBundles = { js: totalJS, css: totalCSS };

    console.log(
      `Total JavaScript: ${colors.bright}${this.formatBytes(totalJS)}${colors.reset}`,
    );
    console.log(
      `Total CSS: ${colors.bright}${this.formatBytes(totalCSS)}${colors.reset}`,
    );

    // Largest bundles
    const largestJS = jsFiles
      .map((file) => ({ file, size: this.getFileSize(file) }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    if (largestJS.length > 0) {
      console.log("\nLargest JavaScript bundles:");
      largestJS.forEach((item, index) => {
        const name = path.basename(item.file);
        const sizeColor =
          item.size > 500000
            ? colors.red
            : item.size > 200000
              ? colors.yellow
              : colors.green;
        console.log(
          `${index + 1}. ${name}: ${sizeColor}${this.formatBytes(item.size)}${colors.reset}`,
        );
      });
    }
    console.log("");
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    const { criticalPath, totalBundles } = this.results;

    // Critical path recommendations
    if (criticalPath.gzip > BUDGETS.criticalPath) {
      recommendations.push({
        type: "critical",
        message: `Critical path exceeds budget: ${this.formatBytes(criticalPath.gzip)} > ${this.formatBytes(BUDGETS.criticalPath)}`,
        suggestion:
          "Consider code splitting and lazy loading non-critical components",
      });
    } else {
      recommendations.push({
        type: "success",
        message: `Critical path within budget: ${this.formatBytes(criticalPath.gzip)} ≤ ${this.formatBytes(BUDGETS.criticalPath)}`,
      });
    }

    // Total JS budget
    if (totalBundles.js > BUDGETS.totalJS * 10) {
      // More lenient for total since we have many lazy chunks
      recommendations.push({
        type: "warning",
        message: `Total JS is large: ${this.formatBytes(totalBundles.js)}`,
        suggestion: "Analyze bundle composition and remove unused dependencies",
      });
    }

    // Compression efficiency
    if (criticalPath.uncompressed > 0) {
      const gzipRatio =
        ((criticalPath.uncompressed - criticalPath.gzip) /
          criticalPath.uncompressed) *
        100;

      recommendations.push({
        type: "success",
        message: `Estimated compression: ${gzipRatio.toFixed(1)}% size reduction with gzip`,
      });
    }

    this.results.recommendations = recommendations;
  }

  // Display recommendations
  displayRecommendations() {
    console.log(
      `${colors.magenta}💡 Performance Recommendations${colors.reset}`,
    );
    console.log("=".repeat(50));

    this.results.recommendations.forEach((rec) => {
      let icon, color;
      switch (rec.type) {
        case "success":
          icon = "✅";
          color = colors.green;
          break;
        case "warning":
          icon = "⚠️";
          color = colors.yellow;
          break;
        case "critical":
          icon = "❌";
          color = colors.red;
          break;
        default:
          icon = "•";
          color = colors.reset;
      }

      console.log(`${icon} ${color}${rec.message}${colors.reset}`);
      if (rec.suggestion) {
        console.log(`  ${colors.cyan}→ ${rec.suggestion}${colors.reset}`);
      }
    });
    console.log("");
  }

  // Core Web Vitals estimation
  estimateWebVitals() {
    console.log(`${colors.yellow}📊 Estimated Core Web Vitals${colors.reset}`);
    console.log("=".repeat(50));

    // Estimate LCP (Largest Contentful Paint) based on critical path size
    const fastConnectionTime = this.calculateLoadTime(
      this.results.criticalPath.gzip,
      CONNECTION_SPEEDS["4G"],
    );
    const lcpEstimate = Math.max(fastConnectionTime * 1000, 800); // Min 800ms

    // Estimate FID (First Input Delay) based on JS bundle size
    const jsSize = this.results.totalBundles.js;
    const fidEstimate = jsSize > 1024000 ? 150 : jsSize > 512000 ? 100 : 50;

    // CLS is architecture dependent, estimate based on lazy loading
    const clsEstimate = 0.1; // Assuming good practices

    console.log(
      `Largest Contentful Paint (LCP): ~${Math.round(lcpEstimate)}ms ${lcpEstimate <= 2500 ? colors.green + "(Good)" : lcpEstimate <= 4000 ? colors.yellow + "(Needs Improvement)" : colors.red + "(Poor)"}${colors.reset}`,
    );
    console.log(
      `First Input Delay (FID): ~${fidEstimate}ms ${fidEstimate <= 100 ? colors.green + "(Good)" : fidEstimate <= 300 ? colors.yellow + "(Needs Improvement)" : colors.red + "(Poor)"}${colors.reset}`,
    );
    console.log(
      `Cumulative Layout Shift (CLS): ~${clsEstimate} ${clsEstimate <= 0.1 ? colors.green + "(Good)" : clsEstimate <= 0.25 ? colors.yellow + "(Needs Improvement)" : colors.red + "(Poor)"}${colors.reset}`,
    );
    console.log("");
  }

  // Export results to JSON
  exportResults() {
    const outputPath = path.join(process.cwd(), "performance-report.json");
    const report = {
      timestamp: new Date().toISOString(),
      criticalPath: this.results.criticalPath,
      totalBundles: this.results.totalBundles,
      budgets: BUDGETS,
      recommendations: this.results.recommendations,
      scores: this.results.scores,
      loadTimes: {},
    };

    // Calculate load times for all connection speeds
    Object.entries(CONNECTION_SPEEDS).forEach(([connection, speed]) => {
      report.loadTimes[connection] = {
        gzip: this.calculateLoadTime(this.results.criticalPath.gzip, speed),
        uncompressed: this.calculateLoadTime(
          this.results.criticalPath.uncompressed,
          speed,
        ),
      };
    });

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(
      `📄 Detailed report exported to: ${colors.cyan}${outputPath}${colors.reset}\n`,
    );
  }

  // Main analysis function
  async analyze() {
    console.log(
      `${colors.bright}${colors.cyan}🚀 ShapeShyft Performance Monitor${colors.reset}\n`,
    );

    // Check if dist exists
    if (!fs.existsSync(this.distPath)) {
      console.error(
        `${colors.red}❌ Error: dist directory not found. Please run 'bun run build' first.${colors.reset}`,
      );
      process.exit(1);
    }

    this.analyzeCriticalPath();
    this.analyzeLoadTimes();
    this.analyzeBundles();
    this.generateRecommendations();
    this.displayRecommendations();
    this.estimateWebVitals();
    this.exportResults();

    console.log(
      `${colors.green}🏁 Performance analysis complete!${colors.reset}`,
    );
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.analyze().catch((error) => {
    console.error(`${colors.red}❌ Analysis failed:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = PerformanceAnalyzer;
