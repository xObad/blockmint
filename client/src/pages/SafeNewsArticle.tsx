/**
 * Safe News Article Page (Compliance Mode)
 * 
 * Full article view for the News section.
 * Displays complete article content.
 */

import { useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

// Mock articles with full content
const articles: Record<string, {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string[];
}> = {
  "1": {
    title: "Cloud Infrastructure Trends 2026",
    category: "Cloud Computing",
    author: "Tech Research Team",
    date: "January 15, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    content: [
      "The cloud computing landscape continues to evolve at an unprecedented pace. As we move further into 2026, several key trends are reshaping how organizations approach their infrastructure needs.",
      "## Edge Computing Integration",
      "One of the most significant developments is the seamless integration between cloud and edge computing. Organizations are no longer choosing between centralized cloud infrastructure and distributed edge nodes – they're implementing hybrid architectures that leverage the strengths of both approaches.",
      "Edge computing has become essential for applications requiring ultra-low latency, such as autonomous systems, real-time analytics, and IoT sensor networks. The latest generation of edge nodes can process complex workloads locally while maintaining synchronization with central cloud resources.",
      "## Sustainability Focus",
      "Environmental considerations have moved from being a nice-to-have to a critical factor in infrastructure decisions. Major cloud providers have committed to carbon-neutral operations, and many are now offering sustainability metrics as part of their standard dashboards.",
      "Organizations are increasingly choosing data center locations based on renewable energy availability, and workload scheduling algorithms now factor in carbon intensity alongside traditional performance metrics.",
      "## Advanced Automation",
      "AI-powered infrastructure management has matured significantly. Modern systems can predict capacity needs, automatically scale resources, and even identify and resolve issues before they impact users.",
      "Self-healing infrastructure is no longer a futuristic concept but a practical reality. Systems continuously monitor their own health and can reconfigure to maintain optimal performance without human intervention.",
      "## Security Evolution",
      "The security landscape has evolved to meet new challenges. Zero-trust architectures are now the default rather than the exception, with every request authenticated and authorized regardless of its origin.",
      "New encryption standards and quantum-resistant algorithms are being deployed preemptively, ensuring that today's data remains protected against tomorrow's threats.",
    ],
  },
  "2": {
    title: "Maximizing Server Uptime",
    category: "Best Practices",
    author: "Operations Team",
    date: "January 12, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    content: [
      "Server uptime is the cornerstone of reliable service delivery. Whether you're running mission-critical applications or customer-facing services, maximizing availability is essential. Here's a comprehensive guide to achieving and maintaining high uptime.",
      "## Understanding the Numbers",
      "When we talk about 'five nines' availability (99.999%), we're talking about less than 5.26 minutes of downtime per year. Achieving this level of reliability requires a holistic approach that addresses hardware, software, network, and human factors.",
      "## Redundancy Architecture",
      "The foundation of high availability is redundancy at every layer. This includes:",
      "• **Hardware redundancy**: Dual power supplies, RAID storage configurations, and hot-standby components ensure that single hardware failures don't cause service interruptions.",
      "• **Network redundancy**: Multiple network paths, diverse connectivity providers, and automatic failover routing prevent network issues from causing downtime.",
      "• **Geographic distribution**: Spreading workloads across multiple data centers or availability zones protects against site-level failures.",
      "## Proactive Monitoring",
      "Effective monitoring goes beyond simply alerting when something breaks. Modern monitoring systems should:",
      "• Track leading indicators that predict potential issues",
      "• Establish baseline performance metrics for anomaly detection",
      "• Provide end-to-end visibility across all system components",
      "• Enable rapid root cause analysis when issues occur",
      "## Maintenance Strategies",
      "Planned maintenance is often the largest contributor to downtime. Strategies to minimize maintenance impact include:",
      "• **Rolling updates**: Update nodes one at a time while keeping the service running on remaining nodes",
      "• **Blue-green deployments**: Maintain parallel environments and switch traffic instantaneously",
      "• **Canary releases**: Gradually roll out changes to a subset of infrastructure before full deployment",
      "## Incident Response",
      "Despite best efforts, incidents will occur. Having a well-practiced incident response process minimizes their impact. Key elements include clear escalation paths, pre-defined runbooks, and regular incident drills.",
    ],
  },
  "3": {
    title: "Edge Computing Benefits",
    category: "Technology",
    author: "Infrastructure Team",
    date: "January 10, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    content: [
      "Edge computing has transformed from an emerging technology to a critical component of modern infrastructure. By processing data closer to its source, edge computing offers distinct advantages that complement traditional cloud architectures.",
      "## Latency Reduction",
      "The most immediate benefit of edge computing is dramatically reduced latency. When data doesn't need to travel to a distant data center and back, response times can drop from hundreds of milliseconds to single-digit milliseconds.",
      "This latency reduction is transformative for real-time applications like video conferencing, gaming, and industrial automation. Users experience smoother, more responsive interactions that weren't possible with purely cloud-based architectures.",
      "## Bandwidth Optimization",
      "Edge computing significantly reduces bandwidth requirements between endpoints and central infrastructure. By processing and filtering data locally, only relevant information needs to traverse the network.",
      "This is particularly valuable for IoT deployments with thousands of sensors generating continuous data streams. Local processing can reduce network traffic by 90% or more while actually improving the quality of insights derived from the data.",
      "## Reliability Improvements",
      "Edge infrastructure can continue operating even when connectivity to central cloud resources is interrupted. This autonomous operation capability is essential for critical systems that cannot tolerate network-dependent failures.",
      "Modern edge nodes include local storage, processing capability, and application logic that allows them to function independently when necessary, then synchronize when connectivity is restored.",
      "## Data Sovereignty",
      "For organizations operating across multiple jurisdictions, edge computing helps address data sovereignty requirements. Data can be processed and stored within specific geographic boundaries while still contributing to global analytics and operations.",
      "This capability is increasingly important as privacy regulations continue to evolve and expand around the world.",
      "## Implementation Considerations",
      "Successful edge deployments require careful attention to management and orchestration. Edge nodes need remote management capabilities, automated updates, and consistent security policies that align with central infrastructure.",
      "The most effective edge strategies treat edge and cloud as complementary rather than competing approaches, using each where its strengths are most valuable.",
    ],
  },
  "4": {
    title: "Cybersecurity Best Practices",
    category: "Security",
    author: "Security Team",
    date: "January 8, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    content: [
      "In today's threat landscape, cybersecurity must be embedded into every aspect of infrastructure design and operation. This guide outlines essential practices for maintaining robust security posture.",
      "## Zero Trust Architecture",
      "Zero trust is no longer optional – it's the foundation of modern security. The core principle is simple: never trust, always verify. Every access request is authenticated and authorized, regardless of whether it originates inside or outside the network perimeter.",
      "Implementing zero trust requires identity-centric security controls, micro-segmentation of networks, and continuous verification throughout each session.",
      "## Defense in Depth",
      "No single security control is sufficient. Defense in depth layers multiple security measures so that if one fails, others continue to protect the system. Key layers include:",
      "• **Network security**: Firewalls, intrusion detection, and traffic encryption",
      "• **Application security**: Secure coding practices, input validation, and vulnerability scanning",
      "• **Data security**: Encryption at rest and in transit, access controls, and data loss prevention",
      "• **Endpoint security**: Device management, malware protection, and patch management",
      "## Security Monitoring",
      "Effective security requires continuous visibility into system behavior. Security information and event management (SIEM) systems aggregate and analyze data from across the infrastructure to identify potential threats.",
      "Advanced threat detection uses machine learning to identify anomalous patterns that might indicate compromise, even when attackers use novel techniques.",
      "## Incident Response",
      "Having a well-defined incident response plan is essential. When security incidents occur, rapid and coordinated response minimizes damage and accelerates recovery. Key elements include:",
      "• Clear roles and responsibilities for incident response team members",
      "• Communication plans for internal and external stakeholders",
      "• Technical procedures for containment, eradication, and recovery",
      "• Post-incident review processes to improve future response",
      "## Continuous Improvement",
      "Security is not a destination but a journey. Regular security assessments, penetration testing, and red team exercises identify weaknesses before attackers can exploit them. Staying current with emerging threats and evolving best practices is essential for maintaining effective security.",
    ],
  },
};

export function SafeNewsArticle() {
  const params = useParams();
  const articleId = params.id || "1";
  const article = articles[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium mb-3">
            {article.category}
          </span>
          <h1 className="text-2xl font-bold">{article.title}</h1>
        </div>
      </div>

      {/* Article Meta */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {article.author}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {article.date}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {article.readTime}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="prose prose-invert prose-lg max-w-none">
          {article.content.map((paragraph, index) => {
            // Handle markdown-style headers
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={index} className="text-xl font-semibold text-cyan-400 mt-8 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            // Handle bullet points
            if (paragraph.startsWith("• ")) {
              return (
                <p key={index} className="text-gray-300 leading-relaxed ml-4 my-2">
                  {paragraph}
                </p>
              );
            }
            // Regular paragraphs
            return (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
          <div className="space-y-3">
            {Object.entries(articles)
              .filter(([id]) => id !== articleId)
              .slice(0, 2)
              .map(([id, art]) => (
                <GlassCard
                  key={id}
                  className="p-4 cursor-pointer hover:bg-gray-800/60 transition-colors"
                  onClick={() => window.location.href = `/safe-news/${id}`}
                >
                  <p className="font-medium">{art.title}</p>
                  <p className="text-sm text-gray-400">{art.category} • {art.readTime}</p>
                </GlassCard>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SafeNewsArticle;
