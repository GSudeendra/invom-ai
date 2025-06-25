from setuptools import find_packages, setup

setup(
    name='ai-analyst',
    version='0.1.0',
    description='AI-powered stock and ETF analysis and recommendation system',
    author='Your Name',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[],
) 