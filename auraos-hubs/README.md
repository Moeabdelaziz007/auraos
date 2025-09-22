# AuraOS Vertical Hubs

This repository contains the source code for the AuraOS Vertical Hubs project. The goal is to create a family of specialized "micro-site" applications for different verticals (e.g., Travel, Food, Shopping) that are deeply integrated with the AuraOS AI core.

## Structure

- `/hub-template`: A reusable template for creating new vertical hubs. This contains the boilerplate for frontend, backend, and AI connectors.
- `/hubs`: This directory will contain the instantiated vertical hubs, each derived from the `hub-template`. (This will be created later).

## Getting Started

1. To create a new hub, copy the `hub-template`.
2. Configure the `hub.config.json` with the specific APIs and settings for the new vertical.
3. Develop the unique features for the new hub.
