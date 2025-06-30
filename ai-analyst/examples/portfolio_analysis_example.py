"""
Example usage of the Financial Analytics framework.

This example demonstrates how to use the framework for comprehensive
portfolio analysis, risk assessment, and quality evaluation.
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# Import the analytics framework
import sys
sys.path.append('src')

from analytics import FinancialAnalytics
from analytics.models import AnalysisRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def basic_portfolio_analysis():
    """Basic portfolio analysis example."""
    print("=== Basic Portfolio Analysis ===")
    
    # Initialize the analytics framework
    analytics = FinancialAnalytics()
    
    try:
        # Define portfolio symbols
        symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
        
        # Create analysis request
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="comprehensive",
            period="1y",
            weights=[0.25, 0.25, 0.20, 0.15, 0.15]  # Equal weight portfolio
        )
        
        print(f"Analyzing portfolio: {symbols}")
        print(f"Analysis type: {request.analysis_type}")
        print(f"Period: {request.period}")
        print(f"Weights: {request.weights}")
        
        # Perform analysis
        response = await analytics.analyze_portfolio(request)
        
        # Display results
        print(f"\nAnalysis completed in {response.processing_time:.2f} seconds")
        print(f"Status: {response.status}")
        
        if response.status == "success":
            data = response.data
            
            # Display summary
            if 'summary' in data:
                summary = data['summary']
                print(f"\nOverall Assessment: {summary['overall_assessment']}")
                
                if 'key_metrics' in summary:
                    metrics = summary['key_metrics']
                    print("\nKey Metrics:")
                    for metric, value in metrics.items():
                        if isinstance(value, float):
                            print(f"  {metric}: {value:.4f}")
                        else:
                            print(f"  {metric}: {value}")
                
                if 'strengths' in summary and summary['strengths']:
                    print("\nStrengths:")
                    for strength in summary['strengths']:
                        print(f"  ✓ {strength}")
                
                if 'weaknesses' in summary and summary['weaknesses']:
                    print("\nWeaknesses:")
                    for weakness in summary['weaknesses']:
                        print(f"  ⚠ {weakness}")
                
                if 'recommendations' in summary and summary['recommendations']:
                    print("\nRecommendations:")
                    for rec in summary['recommendations']:
                        print(f"  → {rec}")
        
        elif response.status == "partial_success":
            print("Analysis completed with some issues:")
            if response.warnings:
                for warning in response.warnings:
                    print(f"  Warning: {warning}")
        
        else:
            print("Analysis failed:")
            if response.errors:
                for error in response.errors:
                    print(f"  Error: {error}")
    
    except Exception as e:
        print(f"Error during analysis: {e}")
    
    finally:
        await analytics.close()


async def risk_analysis_example():
    """Risk analysis example."""
    print("\n=== Risk Analysis Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # High-risk tech portfolio
        symbols = ["TSLA", "NVDA", "AMD", "PLTR", "COIN"]
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="risk",
            period="1y",
            weights=[0.3, 0.25, 0.2, 0.15, 0.1]
        )
        
        print(f"Analyzing risk for: {symbols}")
        
        response = await analytics.analyze_portfolio(request)
        
        if response.status == "success":
            data = response.data
            
            # Display individual risk metrics
            if 'risk_metrics' in data:
                print("\nIndividual Risk Metrics:")
                for symbol, metrics in data['risk_metrics'].items():
                    print(f"\n{symbol}:")
                    print(f"  Risk Score: {metrics['risk_score']}/10")
                    print(f"  Volatility: {metrics['volatility']:.2%}")
                    print(f"  Max Drawdown: {metrics['max_drawdown']:.2%}")
                    if metrics.get('beta'):
                        print(f"  Beta: {metrics['beta']:.2f}")
            
            # Display portfolio risk
            if 'portfolio_risk' in data and data['portfolio_risk']:
                portfolio_risk = data['portfolio_risk']
                print(f"\nPortfolio Risk:")
                print(f"  Overall Risk Score: {portfolio_risk['risk_score']}/10")
                print(f"  Portfolio Volatility: {portfolio_risk['volatility']:.2%}")
                print(f"  Portfolio Max Drawdown: {portfolio_risk['max_drawdown']:.2%}")
                print(f"  Sharpe Ratio: {portfolio_risk.get('sharpe_ratio', 'N/A')}")
    
    except Exception as e:
        print(f"Error during risk analysis: {e}")
    
    finally:
        await analytics.close()


async def quality_evaluation_example():
    """Quality evaluation example."""
    print("\n=== Quality Evaluation Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # Blue-chip stocks
        symbols = ["JNJ", "PG", "KO", "WMT", "JPM"]
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="quality",
            period="2y",
            weights=[0.2, 0.2, 0.2, 0.2, 0.2]
        )
        
        print(f"Evaluating quality for: {symbols}")
        
        response = await analytics.analyze_portfolio(request)
        
        if response.status == "success":
            data = response.data
            
            # Display quality metrics
            if 'quality_metrics' in data:
                print("\nQuality Metrics:")
                for symbol, metrics in data['quality_metrics'].items():
                    print(f"\n{symbol}:")
                    print(f"  Quality Score: {metrics['quality_score']:.1f}/10")
                    print(f"  Quality Rating: {metrics['quality_rating']}")
                    print(f"  Annual Return: {metrics['annual_return']:.2%}")
                    print(f"  Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
                    print(f"  Financial Health: {metrics['financial_health_score']:.1f}/10")
            
            # Display consistency metrics
            if 'consistency_metrics' in data:
                print("\nConsistency Analysis:")
                for symbol, metrics in data['consistency_metrics'].items():
                    print(f"\n{symbol}:")
                    print(f"  Positive Periods: {metrics['positive_periods_ratio']:.1%}")
                    print(f"  Volatility Stability: {metrics['volatility_stability']:.2f}")
                    print(f"  Max Consecutive Losses: {metrics['max_consecutive_losses']}")
    
    except Exception as e:
        print(f"Error during quality evaluation: {e}")
    
    finally:
        await analytics.close()


async def portfolio_optimization_example():
    """Portfolio optimization example."""
    print("\n=== Portfolio Optimization Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # Diversified portfolio
        symbols = ["SPY", "QQQ", "IWM", "EFA", "AGG"]
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="portfolio",
            period="1y",
            weights=[0.3, 0.25, 0.15, 0.2, 0.1]
        )
        
        print(f"Optimizing portfolio: {symbols}")
        
        response = await analytics.analyze_portfolio(request)
        
        if response.status == "success":
            data = response.data
            
            # Display portfolio metrics
            if 'portfolio_metrics' in data:
                metrics = data['portfolio_metrics']
                print(f"\nPortfolio Metrics:")
                print(f"  Total Return: {metrics['total_return']:.2%}")
                print(f"  Annual Return: {metrics['annual_return']:.2%}")
                print(f"  Volatility: {metrics['volatility']:.2%}")
                print(f"  Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
                print(f"  Max Drawdown: {metrics['max_drawdown']:.2%}")
                print(f"  Diversification Score: {metrics['diversification_score']:.1f}/10")
                print(f"  Concentration Risk: {metrics['concentration_risk']:.1f}/10")
            
            # Display sector analysis
            if 'sector_analysis' in data:
                sector_data = data['sector_analysis']
                print(f"\nSector Allocation:")
                for allocation in sector_data['allocations']:
                    print(f"  {allocation['sector']}: {allocation['allocation']:.1f}%")
            
            # Display optimization results
            if 'optimization' in data and data['optimization']:
                opt_data = data['optimization']
                if 'error' not in opt_data:
                    print(f"\nOptimization Results:")
                    print(f"  Expected Return: {opt_data['expected_return']:.2%}")
                    print(f"  Expected Volatility: {opt_data['expected_volatility']:.2%}")
                    print(f"  Expected Sharpe Ratio: {opt_data['expected_sharpe_ratio']:.2f}")
                    print(f"\nOptimal Weights:")
                    for symbol, weight in opt_data['optimal_weights'].items():
                        print(f"  {symbol}: {weight:.1%}")
    
    except Exception as e:
        print(f"Error during portfolio optimization: {e}")
    
    finally:
        await analytics.close()


async def intelligence_score_example():
    """Intelligence score example."""
    print("\n=== Portfolio Intelligence Score Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # Balanced portfolio
        symbols = ["VTI", "VXUS", "BND", "GLD", "VNQ"]
        
        request = AnalysisRequest(
            symbols=symbols,
            analysis_type="intelligence",
            period="1y",
            weights=[0.4, 0.3, 0.2, 0.05, 0.05]
        )
        
        print(f"Calculating intelligence score for: {symbols}")
        
        response = await analytics.analyze_portfolio(request)
        
        if response.status == "success":
            data = response.data
            
            # Display intelligence score
            if 'intelligence_score' in data:
                intel_data = data['intelligence_score']
                print(f"\nPortfolio Intelligence Score:")
                print(f"  Overall Score: {intel_data['intelligence_score']:.1f}/10")
                print(f"  Intelligence Rating: {intel_data['intelligence_rating']}")
                print(f"  Average Quality Score: {intel_data['average_quality_score']:.1f}/10")
                print(f"  Average Risk Score: {intel_data['average_risk_score']:.1f}/10")
                print(f"  Diversification Score: {intel_data['diversification_score']:.1f}/10")
            
            # Display recommendations
            if 'recommendations' in data:
                print(f"\nRecommendations:")
                for i, rec in enumerate(data['recommendations'], 1):
                    print(f"  {i}. {rec}")
    
    except Exception as e:
        print(f"Error during intelligence score calculation: {e}")
    
    finally:
        await analytics.close()


async def data_quality_validation_example():
    """Data quality validation example."""
    print("\n=== Data Quality Validation Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # Test various symbols
        symbols = ["AAPL", "MSFT", "INVALID_SYMBOL", "GOOGL"]
        
        print(f"Validating data quality for: {symbols}")
        
        validation_results = await analytics.validate_data_quality(symbols)
        
        # Display validation results
        print(f"\nValidation Summary:")
        summary = validation_results['summary']
        print(f"  Total Symbols: {summary['total_symbols']}")
        print(f"  Valid Symbols: {summary['valid_symbols']}")
        print(f"  Invalid Symbols: {summary['invalid_symbols']}")
        print(f"  Average Quality Score: {summary['average_quality_score']:.1f}/10")
        
        print(f"\nDetailed Results:")
        for symbol, result in validation_results['validation_results'].items():
            print(f"\n{symbol}:")
            print(f"  Quality Score: {result['quality_score']}/10")
            print(f"  Data Points: {result['data_points']}")
            
            if 'issues' in result and result['issues']:
                print(f"  Issues:")
                for issue in result['issues']:
                    print(f"    ⚠ {issue}")
            
            if 'data_completeness' in result:
                print(f"  Data Completeness: {result['data_completeness']:.1%}")
    
    except Exception as e:
        print(f"Error during data quality validation: {e}")
    
    finally:
        await analytics.close()


async def recommendations_example():
    """Investment recommendations example."""
    print("\n=== Investment Recommendations Example ===")
    
    analytics = FinancialAnalytics()
    
    try:
        # Mixed portfolio for recommendations
        symbols = ["AAPL", "TSLA", "JNJ", "PLTR", "KO"]
        
        print(f"Generating recommendations for: {symbols}")
        
        # Get comprehensive recommendations
        recommendations = await analytics.get_recommendations(symbols, "comprehensive")
        
        if recommendations:
            print(f"\nGenerated {len(recommendations)} recommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"\n{i}. {rec.symbol}")
                print(f"   Action: {rec.action}")
                print(f"   Confidence: {rec.confidence:.1%}")
                print(f"   Risk Level: {rec.risk_level}")
                print(f"   Time Horizon: {rec.time_horizon}")
                print(f"   Reasoning: {rec.reasoning}")
        else:
            print("No specific recommendations generated.")
    
    except Exception as e:
        print(f"Error generating recommendations: {e}")
    
    finally:
        await analytics.close()


async def main():
    """Run all examples."""
    print("Financial Analytics Framework - Examples")
    print("=" * 50)
    
    # Run all examples
    await basic_portfolio_analysis()
    await risk_analysis_example()
    await quality_evaluation_example()
    await portfolio_optimization_example()
    await intelligence_score_example()
    await data_quality_validation_example()
    await recommendations_example()
    
    print("\n" + "=" * 50)
    print("All examples completed!")


if __name__ == "__main__":
    # Run the examples
    asyncio.run(main()) 