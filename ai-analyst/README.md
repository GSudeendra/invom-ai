# ai-analyst

A modular Python project for stock and ETF data analysis, feature engineering, modeling, and AI-driven recommendations based on historical data.

## Project Structure

```
ai-analyst/
├── data/                # Data storage (external, interim, processed, raw)
│   ├── external/        # Third-party data sources
│   ├── interim/         # Intermediate, transformed data
│   ├── processed/       # Final, canonical datasets
│   └── raw/             # Original, immutable data dumps
├── docs/                # Sphinx documentation
├── models/              # Trained/serialized models, predictions, summaries
├── notebooks/           # Jupyter notebooks (exploration, prototyping)
├── references/          # Data dictionaries, manuals, explanatory materials
├── reports/             # Generated analysis (HTML, PDF, LaTeX, etc.)
│   └── figures/         # Generated graphics/figures for reports
├── requirements.txt     # Python dependencies
├── setup.py             # Make project pip installable
├── src/                 # Source code for data, features, models, visualization
│   ├── __init__.py
│   ├── data/            # Data download/generation scripts
│   │   └── make_dataset.py
│   ├── features/        # Feature engineering scripts
│   │   └── build_features.py
│   ├── models/          # Model training/prediction scripts
│   │   ├── train_model.py
│   │   └── predict_model.py
│   └── visualization/   # Visualization scripts
│       └── visualize.py
└── tox.ini              # Tox config for testing/QA
```

## Key Features
- Clean, modular structure for reproducible research and production ML
- Jupyter notebooks for exploration and prototyping
- Scripts for data ingestion, feature engineering, modeling, and visualization
- Ready for Sphinx documentation and automated testing

---

**Start here:**
- Place raw data in `data/raw/`
- Use `src/data/make_dataset.py` to process data
- Build features with `src/features/build_features.py`
- Train models with `src/models/train_model.py`
- Generate reports and visualizations in `reports/` and `src/visualization/` 