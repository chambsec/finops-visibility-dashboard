# FinOps Dashboard

A serverless cost and revenue visibility dashboard, built to unify cloud infrastructure spend, third-party SaaS costs, and revenue into a single live view.

**Live demo:** https://finops.chamb.dev

All data shown is synthetic, modeled on a fictional company, Northwind Signal, a newsletter and media business. The figures are shaped to mirror real AWS Cost Explorer and Stripe API responses, but no real account data, business figures, or proprietary information appears anywhere in this repo.

## The problem

Solo operators and small teams running infrastructure on AWS, paying for a handful of SaaS tools, and collecting subscription revenue through Stripe end up with their financial picture scattered across three or four different dashboards. There's no single place to see net margin, no easy way to model what revenue is needed to break even, and no lightweight way to track cost creep across services.

## The approach

This dashboard demonstrates a pattern for solving that with minimal infrastructure:

EventBridge (hourly) -> Aggregator Lambda -> AWS Cost Explorer API and Stripe API -> DynamoDB (single-table, latest snapshot, 90-day TTL) -> API Gateway -> React frontend

The version deployed here is intentionally simpler: a static React build seeded with synthetic data, deployed to S3 and CloudFront. The infrastructure folder contains the CloudFormation template for that static hosting layer. The architecture above describes the natural next step, wiring the frontend to a live aggregator Lambda, which is a straightforward extension of this same pattern.

## Design decisions

Cost Explorer API over Cost and Usage Reports plus Athena. CUR is more granular and cheaper at scale, but requires an S3 export pipeline and a query engine for what's a single-account, low-volume use case. Cost Explorer's API gives grouped, summarized data directly, which is the right tradeoff below a certain spend threshold.

DynamoDB single-table over RDS. The access pattern is simple: write one snapshot per hour, read the latest one plus a 30-day window for trend lines. No joins, no relational structure needed. DynamoDB's on-demand billing also means this costs nothing at low volume.

Hourly polling over real-time. Cost data from AWS isn't real-time to begin with. Cost Explorer typically lags actual spend by several hours. Polling hourly matches the actual freshness of the underlying data rather than over-engineering for immediacy the source data can't provide.

Static deploy for the public demo. This repo is a portfolio artifact, not a production system. A static build with seeded data demonstrates the UI and architecture without requiring a live AWS account in the loop for every visitor.

## Stack

React, TypeScript, and Vite. Chart.js via react-chartjs-2. AWS S3, CloudFront, and ACM for static hosting. CloudFormation for infrastructure as code.

## Project structure

finops-dashboard/
- frontend/: React app
  - src/Dashboard.tsx: main dashboard component
  - src/Dashboard.css: styling
  - src/data/northwind.ts: synthetic seed data
- infrastructure/static-hosting.yaml: S3, CloudFront, and ACM CloudFormation template
- README.md

## Running locally

cd frontend
npm install
npm run dev

## Deploying your own copy

1. Request an ACM certificate in us-east-1 for your domain.
2. Deploy the CloudFormation stack:

aws cloudformation deploy --template-file infrastructure/static-hosting.yaml --stack-name finops-dashboard --parameter-overrides AcmCertificateArn=<your-cert-arn> --region us-east-1

3. Build and sync:

cd frontend && npm run build
aws s3 sync dist/ s3://<your-bucket-name>/ --delete

4. Point your DNS at the CloudFront distribution output by the stack.
