# SensiLog - Riot API Application Project Description

## Project Overview

SensiLog is a free web application that helps VALORANT players analyze the correlation between their mouse sensitivity settings and match performance to find their optimal settings.

## Key Features

### 1. Sensitivity Settings History Management
- Record in-game sensitivity, DPI, Windows sensitivity, and other settings
- Manage setting change history chronologically
- Categorize settings with tags (e.g., "High Sensitivity", "Low Sensitivity", "Experimental")

### 2. Automatic Match Data Retrieval
- Retrieve VALORANT match data using Riot API
- Collect statistics such as K/D ratio, headshot percentage, and average combat score
- Visualize performance trends per match

### 3. Performance Analysis
- Analyze correlation between sensitivity settings and match performance
- Visual feedback through graphs and charts
- Identify settings with the best performance

### 4. Settings Recommendations
- Suggest optimal sensitivity settings based on historical data
- Compare with professional player settings (as reference information)

## Riot API Policy Compliance

### Compliance Items
- ✅ **Completely Free**: All features are provided free of charge with no fees
- ✅ **Player Improvement Support**: Aimed at helping players evaluate and improve their own gameplay
- ✅ **Positive Experience**: Praise players and present improvement points constructively
- ✅ **API Key Protection**: Implement secure management using environment variables
- ✅ **No Official Logos**: Do not use Riot Games official logos

### Prohibited Items Response
- ❌ **No Player Shaming**: No comparisons with other players or critical expressions
- ❌ **No MMR/ELO Calculation**: No implementation of custom skill rating systems
- ❌ **No Reporting Features**: No features to evaluate or report players
- ❌ **No Unfair Advantages**: No features that compromise game integrity

## Technical Specifications

### API Endpoints Used
- Account-V1: Retrieve player information
- Match-V1: Retrieve match history
- Usage Frequency: Maximum ~20 requests per user per day

### Security Measures
- API keys managed server-side
- Use of HTTPS communication
- Implementation of rate limiting

## Project Goals

1. **Player Growth Support**: Support players in finding optimal settings through data-based objective analysis
2. **Community Contribution**: Provide a scientific approach to players struggling with sensitivity settings
3. **Positive Experience**: Focus on self-improvement and contribute to player motivation

## Developer Information

- Project Name: SensiLog
- Development Stage: Prototype in development
- Public Release: After Riot API approval
- Source Code: Open source planned (GitHub)

## Additional Confirmations

- Will not claim partnership or approval with Riot Games
- Development API keys used only for prototype development
- Only approved Production API keys will be used in production environment

This project fully complies with Riot Games policies and aims to provide positive value to the VALORANT community.