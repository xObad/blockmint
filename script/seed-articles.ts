/**
 * Seed Educational Articles Script
 * 
 * This script populates the articles table with professional
 * educational content about Bitcoin cloud mining.
 * 
 * Run with: npx tsx script/seed-articles.ts
 */

import { db } from "../server/db";
import { articles } from "../shared/schema";
import { sql } from "drizzle-orm";

const educationalArticles = [
  {
    title: "What is Bitcoin Cloud Mining?",
    description: `
      <h2>Introduction to Cloud Mining</h2>
      <p>Bitcoin cloud mining allows you to mine cryptocurrency without owning or maintaining physical mining hardware. Instead of purchasing expensive equipment and paying for electricity, you rent computational power from a remote data center.</p>
      
      <h3>How It Works</h3>
      <p>When you participate in cloud mining, you're essentially purchasing a share of mining power from a professional mining operation. The mining facility handles all the technical aspects including:</p>
      <ul>
        <li>Hardware maintenance and upgrades</li>
        <li>Electricity costs and cooling systems</li>
        <li>Network connectivity and uptime</li>
        <li>Security and physical protection</li>
      </ul>
      
      <h3>Benefits of Cloud Mining</h3>
      <p>Cloud mining offers several advantages for beginners:</p>
      <ul>
        <li><strong>No Hardware Required:</strong> Start mining without purchasing expensive ASICs or GPUs</li>
        <li><strong>No Technical Knowledge Needed:</strong> The provider handles all technical operations</li>
        <li><strong>No Noise or Heat:</strong> Mining equipment stays at the data center, not your home</li>
        <li><strong>Lower Entry Barrier:</strong> Start with smaller investments compared to buying hardware</li>
      </ul>
      
      <p>Cloud mining makes cryptocurrency mining accessible to everyone, regardless of technical expertise or available space for equipment.</p>
    `,
    category: "Basics",
    icon: "☁️",
    order: 1,
    isActive: true,
  },
  {
    title: "Understanding Hash Rate",
    description: `
      <h2>What is Hash Rate?</h2>
      <p>Hash rate measures the computational power used in cryptocurrency mining. It represents how many calculations (hashes) a miner can perform per second when trying to solve the cryptographic puzzles required to validate transactions and add new blocks to the blockchain.</p>
      
      <h3>Hash Rate Units</h3>
      <p>Hash rates are measured in different units based on scale:</p>
      <ul>
        <li><strong>H/s:</strong> Hashes per second (basic unit)</li>
        <li><strong>KH/s:</strong> Kilo hashes (1,000 H/s)</li>
        <li><strong>MH/s:</strong> Mega hashes (1,000,000 H/s)</li>
        <li><strong>GH/s:</strong> Giga hashes (1,000,000,000 H/s)</li>
        <li><strong>TH/s:</strong> Tera hashes (1,000,000,000,000 H/s)</li>
      </ul>
      
      <h3>Why Hash Rate Matters</h3>
      <p>Your hash rate directly affects your mining rewards. A higher hash rate means:</p>
      <ul>
        <li>More chances to solve blocks and earn rewards</li>
        <li>Greater share of the mining pool's earnings</li>
        <li>Better return on your mining investment</li>
      </ul>
      
      <p>In cloud mining, your purchased hash rate determines your daily earnings based on current network difficulty and cryptocurrency prices.</p>
    `,
    category: "Basics",
    icon: "⚡",
    order: 2,
    isActive: true,
  },
  {
    title: "Mining Pools Explained",
    description: `
      <h2>What are Mining Pools?</h2>
      <p>A mining pool is a group of miners who combine their computational resources to increase their chances of successfully mining blocks. When a block is found, the reward is distributed among all pool participants based on their contributed hash power.</p>
      
      <h3>Why Pools Exist</h3>
      <p>Solo mining Bitcoin has become extremely difficult due to the high network difficulty. For individual miners, the probability of finding a block alone is very low. Pools solve this by:</p>
      <ul>
        <li>Combining hash power from thousands of miners</li>
        <li>Providing more consistent, smaller payouts</li>
        <li>Reducing variance in mining income</li>
      </ul>
      
      <h3>Pool Reward Methods</h3>
      <p>Common reward distribution methods include:</p>
      <ul>
        <li><strong>PPS (Pay Per Share):</strong> Fixed payment for each valid share submitted</li>
        <li><strong>PPLNS (Pay Per Last N Shares):</strong> Payment based on shares in a time window</li>
        <li><strong>FPPS (Full Pay Per Share):</strong> PPS plus transaction fee rewards</li>
      </ul>
      
      <p>Cloud mining services typically manage pool selection for you, optimizing for the best returns automatically.</p>
    `,
    category: "Strategy",
    icon: "🏊",
    order: 3,
    isActive: true,
  },
  {
    title: "Bitcoin Halving & Mining Rewards",
    description: `
      <h2>Understanding Bitcoin Halving</h2>
      <p>Bitcoin halving is a scheduled event that occurs approximately every four years (every 210,000 blocks). During a halving, the block reward that miners receive is cut in half, reducing the rate at which new Bitcoin enters circulation.</p>
      
      <h3>Halving History</h3>
      <ul>
        <li><strong>2009:</strong> Initial reward of 50 BTC per block</li>
        <li><strong>2012:</strong> First halving - 25 BTC per block</li>
        <li><strong>2016:</strong> Second halving - 12.5 BTC per block</li>
        <li><strong>2020:</strong> Third halving - 6.25 BTC per block</li>
        <li><strong>2024:</strong> Fourth halving - 3.125 BTC per block</li>
      </ul>
      
      <h3>Impact on Mining</h3>
      <p>Halvings affect mining economics significantly:</p>
      <ul>
        <li>Miners receive fewer Bitcoin per block</li>
        <li>Less efficient miners may become unprofitable</li>
        <li>Historically, halvings have preceded price increases</li>
        <li>Transaction fees become more important for miner revenue</li>
      </ul>
      
      <p>Cloud mining contracts account for these changes, with profitability adjusting based on network conditions and Bitcoin's market price.</p>
    `,
    category: "Economics",
    icon: "📉",
    order: 4,
    isActive: true,
  },
  {
    title: "Wallet Security Best Practices",
    description: `
      <h2>Protecting Your Cryptocurrency</h2>
      <p>Securing your cryptocurrency wallet is crucial for protecting your mining rewards. Following security best practices can prevent theft and loss of your digital assets.</p>
      
      <h3>Essential Security Tips</h3>
      <ul>
        <li><strong>Enable Two-Factor Authentication (2FA):</strong> Add an extra layer of security to all crypto accounts</li>
        <li><strong>Use Strong, Unique Passwords:</strong> Never reuse passwords across different platforms</li>
        <li><strong>Verify Wallet Addresses:</strong> Always double-check addresses before sending cryptocurrency</li>
        <li><strong>Keep Software Updated:</strong> Regular updates patch security vulnerabilities</li>
      </ul>
      
      <h3>Types of Wallets</h3>
      <ul>
        <li><strong>Hot Wallets:</strong> Connected to the internet, convenient but less secure</li>
        <li><strong>Cold Wallets:</strong> Offline storage, more secure for large holdings</li>
        <li><strong>Hardware Wallets:</strong> Physical devices that store private keys offline</li>
      </ul>
      
      <h3>Common Threats to Avoid</h3>
      <ul>
        <li>Phishing websites and emails</li>
        <li>Fake wallet apps and browser extensions</li>
        <li>Social engineering attacks</li>
        <li>Malware and keyloggers</li>
      </ul>
      
      <p>Always withdraw your mining rewards to a wallet you control, and never share your private keys or seed phrases with anyone.</p>
    `,
    category: "Security",
    icon: "🔐",
    order: 5,
    isActive: true,
  },
  {
    title: "Understanding Mining Difficulty",
    description: `
      <h2>What is Mining Difficulty?</h2>
      <p>Mining difficulty is a measure of how hard it is to find a valid block hash. The Bitcoin network automatically adjusts difficulty approximately every two weeks (2,016 blocks) to maintain an average block time of about 10 minutes.</p>
      
      <h3>How Difficulty Adjusts</h3>
      <p>The adjustment mechanism works as follows:</p>
      <ul>
        <li>If blocks are found too quickly (more miners), difficulty increases</li>
        <li>If blocks are found too slowly (fewer miners), difficulty decreases</li>
        <li>The target is always 10 minutes average between blocks</li>
      </ul>
      
      <h3>Impact on Miners</h3>
      <p>Rising difficulty means:</p>
      <ul>
        <li>Same hash rate produces fewer Bitcoin</li>
        <li>More computational power needed to maintain earnings</li>
        <li>Operating costs remain constant while rewards may decrease</li>
      </ul>
      
      <h3>Historical Trend</h3>
      <p>Bitcoin's mining difficulty has generally trended upward over time as more miners join the network and hardware becomes more powerful. This is an important factor to consider when evaluating mining investments.</p>
      
      <p>Cloud mining providers monitor difficulty changes and adjust expectations accordingly to provide accurate earning projections.</p>
    `,
    category: "Advanced",
    icon: "📊",
    order: 6,
    isActive: true,
  },
  {
    title: "Litecoin vs Bitcoin Mining",
    description: `
      <h2>Comparing LTC and BTC Mining</h2>
      <p>While Bitcoin and Litecoin share similarities, they use different mining algorithms and have distinct characteristics that affect mining profitability and approach.</p>
      
      <h3>Key Differences</h3>
      <table>
        <tr><th>Feature</th><th>Bitcoin</th><th>Litecoin</th></tr>
        <tr><td>Algorithm</td><td>SHA-256</td><td>Scrypt</td></tr>
        <tr><td>Block Time</td><td>~10 minutes</td><td>~2.5 minutes</td></tr>
        <tr><td>Total Supply</td><td>21 million</td><td>84 million</td></tr>
        <tr><td>Hardware</td><td>ASIC</td><td>ASIC (Scrypt-based)</td></tr>
      </table>
      
      <h3>Mining Considerations</h3>
      <ul>
        <li><strong>Faster Confirmations:</strong> Litecoin's quicker block time means faster transaction confirmations</li>
        <li><strong>Different Hardware:</strong> BTC and LTC require different specialized mining equipment</li>
        <li><strong>Market Dynamics:</strong> Each cryptocurrency has different price volatility and market liquidity</li>
        <li><strong>Difficulty Levels:</strong> Each network has independent difficulty adjustments</li>
      </ul>
      
      <p>Diversifying across both cryptocurrencies can help balance risk and reward in your mining portfolio.</p>
    `,
    category: "Strategy",
    icon: "⚖️",
    order: 7,
    isActive: true,
  },
  {
    title: "Maximizing Mining Returns",
    description: `
      <h2>Strategies for Better Mining Profits</h2>
      <p>Optimizing your cloud mining strategy can significantly improve your returns over time. Here are proven approaches to maximize your mining profitability.</p>
      
      <h3>Timing Strategies</h3>
      <ul>
        <li><strong>Dollar-Cost Averaging:</strong> Invest consistently over time rather than all at once</li>
        <li><strong>Monitor Network Conditions:</strong> Difficulty changes affect short-term profitability</li>
        <li><strong>Consider Market Cycles:</strong> Crypto markets move in cycles that affect mining economics</li>
      </ul>
      
      <h3>Diversification Tips</h3>
      <ul>
        <li>Mine multiple cryptocurrencies to spread risk</li>
        <li>Balance between established coins (BTC) and altcoins (LTC)</li>
        <li>Consider different contract lengths</li>
      </ul>
      
      <h3>Compound Your Earnings</h3>
      <ul>
        <li>Reinvest a portion of mining rewards into additional hash power</li>
        <li>Hold earnings during favorable market conditions</li>
        <li>Set profit targets and stick to your strategy</li>
      </ul>
      
      <h3>Stay Informed</h3>
      <p>Keep up with industry news, network upgrades, and market developments. Educated miners make better decisions about when to hold, when to sell, and when to expand their mining operations.</p>
    `,
    category: "Strategy",
    icon: "📈",
    order: 8,
    isActive: true,
  },
];

async function seedArticles() {
  console.log("🚀 Starting article seeding...\n");

  try {
    // First, clear existing articles
    console.log("📋 Clearing existing articles...");
    await db.delete(articles);
    console.log("✅ Existing articles cleared\n");

    // Insert new articles
    console.log("📝 Inserting educational articles...");
    
    for (const article of educationalArticles) {
      await db.insert(articles).values({
        title: article.title,
        description: article.description.trim(),
        category: article.category,
        icon: article.icon,
        image: null,
        order: article.order,
        isActive: article.isActive,
        updatedAt: new Date(),
      });
      console.log(`  ✓ Added: "${article.title}"`);
    }

    console.log(`\n✅ Successfully seeded ${educationalArticles.length} articles!`);
    console.log("\n📚 Categories included:");
    console.log("  - Basics (2 articles)");
    console.log("  - Strategy (3 articles)");
    console.log("  - Security (1 article)");
    console.log("  - Economics (1 article)");
    console.log("  - Advanced (1 article)");

  } catch (error) {
    console.error("❌ Error seeding articles:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedArticles();
