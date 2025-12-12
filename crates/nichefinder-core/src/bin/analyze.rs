//! CLI tool for analyzing integration opportunities

use nichefinder_core::{IntegrationAnalyzer, AnalysisConfig};
use std::path::PathBuf;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "nichefinder-analyze")]
#[command(about = "Analyze Home Assistant integration opportunities", long_about = None)]
struct Args {
    /// Path to HACS data file
    #[arg(long, default_value = "data/raw/fetch_hacs_integrations-result.json")]
    hacs_data: PathBuf,
    
    /// Path to GitHub data file
    #[arg(long, default_value = "data/raw/search_github_repos-result.json")]
    github_data: PathBuf,
    
    /// Path to YouTube data file
    #[arg(long, default_value = "data/raw/search_youtube_videos-result.json")]
    youtube_data: PathBuf,
    
    /// Minimum score threshold (0-100)
    #[arg(long, default_value = "50.0")]
    min_score: f64,
    
    /// Maximum number of results to return
    #[arg(long, default_value = "20")]
    max_results: usize,
    
    /// Output format (json or markdown)
    #[arg(long, default_value = "markdown")]
    format: String,
}

fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into())
        )
        .init();
    
    let args = Args::parse();
    
    // Create analysis configuration
    let config = AnalysisConfig {
        min_score: args.min_score,
        max_results: args.max_results,
        ..Default::default()
    };
    
    // Create analyzer
    let analyzer = IntegrationAnalyzer::with_config(config);
    
    // Run analysis
    tracing::info!("Starting analysis...");
    tracing::info!("  HACS data: {}", args.hacs_data.display());
    tracing::info!("  GitHub data: {}", args.github_data.display());
    tracing::info!("  YouTube data: {}", args.youtube_data.display());
    
    let result = analyzer.analyze_from_files(
        args.hacs_data.to_str().unwrap(),
        args.github_data.to_str().unwrap(),
        args.youtube_data.to_str().unwrap(),
    )?;
    
    tracing::info!("Analysis complete!");
    tracing::info!("  Total candidates: {}", result.metadata.total_candidates);
    tracing::info!("  Qualified candidates: {}", result.metadata.qualified_candidates);
    tracing::info!("  Duration: {:.2}s", result.metadata.duration_secs);
    
    // Output results
    match args.format.as_str() {
        "json" => {
            let json = serde_json::to_string_pretty(&result)?;
            println!("{}", json);
        }
        "markdown" => {
            print_markdown_report(&result);
        }
        _ => {
            eprintln!("Unknown format: {}", args.format);
            std::process::exit(1);
        }
    }
    
    Ok(())
}

fn print_markdown_report(result: &nichefinder_core::AnalysisResult) {
    println!("# Home Assistant Integration Opportunities");
    println!();
    println!("**Analysis Date:** {}", result.analyzed_at.format("%Y-%m-%d %H:%M:%S UTC"));
    println!("**Total Candidates:** {}", result.metadata.total_candidates);
    println!("**Qualified Opportunities:** {}", result.metadata.qualified_candidates);
    println!("**Analysis Duration:** {:.2}s", result.metadata.duration_secs);
    println!();
    println!("---");
    println!();
    
    for (i, opportunity) in result.opportunities.iter().enumerate() {
        println!("## {}. {} (Score: {:.1}/100)", i + 1, opportunity.name, opportunity.score);
        println!();
        println!("**Category:** {}", opportunity.category);
        println!();
        
        // Scoring breakdown
        println!("**Scoring Breakdown:**");
        println!("- Demand: {:.1}/100", opportunity.scoring_details.demand);
        println!("- Feasibility: {:.1}/100", opportunity.scoring_details.feasibility);
        println!("- Competition: {:.1}/100", opportunity.scoring_details.competition);
        println!("- Trend: {:.1}/100", opportunity.scoring_details.trend);
        println!();
        
        // Metadata
        if let Some(github_url) = opportunity.metadata.get("github_url").and_then(|v| v.as_str()) {
            println!("**GitHub:** {}", github_url);
        }
        if let Some(stars) = opportunity.metadata.get("stars").and_then(|v| v.as_u64()) {
            println!("**Stars:** {}", stars);
        }
        if let Some(forks) = opportunity.metadata.get("forks").and_then(|v| v.as_u64()) {
            println!("**Forks:** {}", forks);
        }
        if let Some(issues) = opportunity.metadata.get("open_issues").and_then(|v| v.as_u64()) {
            println!("**Open Issues:** {}", issues);
        }
        if let Some(in_hacs) = opportunity.metadata.get("in_hacs").and_then(|v| v.as_bool()) {
            println!("**In HACS:** {}", if in_hacs { "Yes" } else { "No" });
        }
        if let Some(youtube) = opportunity.metadata.get("youtube_mentions").and_then(|v| v.as_u64()) {
            println!("**YouTube Mentions:** {}", youtube);
        }
        
        println!();
        println!("**Data Sources:** {} sources", opportunity.data_sources.len());
        for source in &opportunity.data_sources {
            println!("- {} ({} data points)", source.name, source.data_points);
        }
        
        println!();
        println!("---");
        println!();
    }
}

