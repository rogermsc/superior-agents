# Agent Integration Guide for Meta Swap API

## Overview

This document provides comprehensive guidance for integrating autonomous self-learning AI agents with the Agent-Centric Meta Swap API. The platform has been specifically designed to support agent learning, specialization, and multi-agent coordination in the DeFi space.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Agent Authentication and Registration](#agent-authentication-and-registration)
3. [Observation Space](#observation-space)
4. [Action Space](#action-space)
5. [Reward System](#reward-system)
6. [Learning Environment](#learning-environment)
7. [Multi-Agent Coordination](#multi-agent-coordination)
8. [Agent Specialization](#agent-specialization)
9. [Performance Analytics](#performance-analytics)
10. [Best Practices](#best-practices)
11. [Example Implementations](#example-implementations)

## Architecture Overview

The Agent-Centric Meta Swap API extends the original Meta Swap API with specialized components designed for autonomous agent learning and operation:

```
┌─────────────────────────────────────────────────────────────┐
│                  Agent-Centric Meta Swap API                │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Original   │    Agent    │  Simulation    │  Multi-Agent  │
│  Meta Swap  │  Learning   │  Environment   │ Coordination  │
│     API     │  Framework  │                │               │
├─────────────┼─────────────┼────────────────┼───────────────┤
│  Addresses  │ Observation │  Historical    │ Coordination  │
│    Swap     │   Action    │   Scenarios    │ Communication │
│  Transfer   │   Reward    │  Time Control  │ Shared Memory │
│  Providers  │ Rate Limits │     State      │Specialization │
└─────────────┴─────────────┴────────────────┴───────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Analytics & Telemetry                    │
├─────────────┬─────────────┬────────────────┬───────────────┤
│  Telemetry  │  Benchmarks │ Visualization  │    Learning   │
│ Collection  │             │                │    Progress   │
└─────────────┴─────────────┴────────────────┴───────────────┘
```

## Agent Authentication and Registration

Before an agent can interact with the platform, it must be authenticated and registered.

### Authentication

```typescript
// Register a new agent
POST /agent/auth/register
{
  "agentId": "unique_agent_identifier",
  "name": "Trading Agent Alpha",
  "capabilities": ["price_analysis", "swap_execution"],
  "apiKey": "your_api_key"
}

// Authenticate an agent
POST /agent/auth/login
{
  "agentId": "unique_agent_identifier",
  "apiKey": "your_api_key"
}
```

All subsequent requests must include the authentication token in the Authorization header:

```
Authorization: Bearer {token}
```

## Observation Space

The observation space provides standardized market data and environment state for agent learning.

### Market Observations

```typescript
// Get current market state
GET /agent/observation/market?symbols=ETH,BTC,SOL

// Get historical market data
GET /agent/observation/market/historical?symbol=ETH&timeframe=1h&limit=100

// Subscribe to real-time market updates
POST /agent/observation/market/subscribe
{
  "symbols": ["ETH", "BTC", "SOL"],
  "interval": "1m"
}
```

### Portfolio Observations

```typescript
// Get current portfolio state
GET /agent/observation/portfolio?agentId=unique_agent_identifier

// Get historical portfolio performance
GET /agent/observation/portfolio/historical?timeframe=1d&limit=30
```

## Action Space

The action space defines the operations agents can perform.

### Swap Actions

```typescript
// Execute a token swap
POST /agent/action/swap
{
  "agentId": "unique_agent_identifier",
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "0.5",
  "maxSlippage": "0.01",
  "provider": "auto"  // Automatically select best provider
}

// Get swap quote
GET /agent/action/swap/quote?fromToken=ETH&toToken=USDC&amount=0.5
```

### Transfer Actions

```typescript
// Execute a token transfer
POST /agent/action/transfer
{
  "agentId": "unique_agent_identifier",
  "token": "USDC",
  "amount": "100",
  "recipient": "0x123...abc"
}
```

## Reward System

The reward system provides feedback signals for reinforcement learning.

### Reward Components

```typescript
// Get reward for a specific action
GET /agent/reward/action/{actionId}

// Get cumulative rewards
GET /agent/reward/cumulative?timeframe=1d

// Configure reward weights
POST /agent/reward/configure
{
  "profitWeight": 0.7,
  "riskWeight": 0.2,
  "gasWeight": 0.1
}
```

## Learning Environment

The learning environment provides simulation capabilities for agent training.

### Historical Replay

```typescript
// Start historical replay session
POST /simulation/historical/start
{
  "startTime": "2023-01-01T00:00:00Z",
  "endTime": "2023-01-31T23:59:59Z",
  "symbols": ["ETH", "BTC", "USDC"],
  "initialPortfolio": {
    "ETH": "10",
    "USDC": "10000"
  },
  "speed": 1000  // 1000x speed
}

// Get next observation in replay
GET /simulation/historical/next

// End replay session
POST /simulation/historical/end
```

### Scenario Generation

```typescript
// Create a market scenario
POST /simulation/scenarios/create
{
  "name": "Bull Market",
  "description": "Simulates a strong bull market with 20% price increase",
  "baseMarket": "current",
  "modifications": [
    {
      "symbol": "ETH",
      "priceChange": 0.2,
      "volatility": 0.05,
      "timeframe": "7d"
    }
  ]
}

// Run a scenario
POST /simulation/scenarios/run/{scenarioId}
```

### Time Control

```typescript
// Accelerate simulation time
POST /simulation/time-control/accelerate
{
  "factor": 100  // 100x speed
}

// Pause simulation
POST /simulation/time-control/pause

// Resume simulation
POST /simulation/time-control/resume
```

## Multi-Agent Coordination

The multi-agent coordination layer enables collaborative learning and operation.

### Agent Pools

```typescript
// Create an agent pool
POST /multi-agent/coordination/pools
{
  "name": "Trading Team Alpha",
  "description": "A team of specialized trading agents",
  "specializations": ["market_making", "arbitrage", "trend_following"]
}

// Add agent to pool
POST /multi-agent/coordination/pools/agents
{
  "poolId": "pool_123",
  "agentId": "agent_456",
  "name": "Trend Follower",
  "specializations": ["trend_following"]
}
```

### Task Allocation

```typescript
// Create a task allocation
POST /multi-agent/coordination/tasks
{
  "poolId": "pool_123",
  "name": "Market Analysis",
  "description": "Analyze ETH/USDC market for trading opportunities",
  "requiredSpecializations": ["trend_following", "market_analysis"]
}

// Submit task result
POST /multi-agent/coordination/tasks/results
{
  "taskId": "task_789",
  "agentId": "agent_456",
  "result": {
    "trend": "bullish",
    "confidence": 0.85,
    "recommendedAction": "buy"
  },
  "confidence": 0.85
}
```

### Communication

```typescript
// Send direct message to another agent
POST /multi-agent/communication/messages/direct
{
  "senderId": "agent_123",
  "recipientId": "agent_456",
  "content": {
    "observation": "Price breakout detected on ETH/USDC",
    "confidence": 0.9
  },
  "type": "observation"
}

// Create communication channel
POST /multi-agent/communication/channels
{
  "name": "Market Analysis",
  "description": "Channel for sharing market analysis",
  "createdBy": "agent_123"
}

// Send message to channel
POST /multi-agent/communication/channels/messages
{
  "channelId": "channel_789",
  "senderId": "agent_123",
  "content": {
    "symbol": "ETH/USDC",
    "pattern": "double bottom",
    "confidence": 0.75
  },
  "type": "pattern_recognition"
}
```

### Shared Memory

```typescript
// Create memory space
POST /multi-agent/shared-memory/spaces
{
  "name": "Market Patterns",
  "description": "Shared knowledge of identified market patterns",
  "createdBy": "agent_123",
  "type": "pattern_recognition"
}

// Add knowledge entry
POST /multi-agent/shared-memory/entries
{
  "spaceId": "space_456",
  "agentId": "agent_123",
  "key": "eth_usdc_double_bottom_20230615",
  "value": {
    "pattern": "double bottom",
    "symbol": "ETH/USDC",
    "timeframe": "4h",
    "confidence": 0.85,
    "expectedOutcome": "bullish"
  },
  "tags": ["pattern", "eth", "bullish"],
  "confidence": 0.85
}

// Query knowledge entries
GET /multi-agent/shared-memory/spaces/space_456/entries?keyPattern=eth_.*&tags=bullish&minConfidence=0.8
```

## Agent Specialization

The specialization system enables agents to develop and leverage specialized capabilities.

### Specialization Domains

```typescript
// Create specialization domain
POST /multi-agent/specialization/domains
{
  "name": "Trend Following",
  "description": "Specialization in identifying and following market trends",
  "createdBy": "agent_123",
  "domain": "trading",
  "capabilities": [
    {
      "name": "trend_identification",
      "description": "Ability to identify market trends",
      "evaluationCriteria": ["accuracy", "timeliness"]
    },
    {
      "name": "entry_exit_timing",
      "description": "Ability to time market entries and exits",
      "evaluationCriteria": ["profit_factor", "win_rate"]
    }
  ],
  "learningPath": [
    {
      "name": "Basic Trend Identification",
      "description": "Learn to identify basic market trends",
      "targetProficiency": 0.3
    },
    {
      "name": "Advanced Pattern Recognition",
      "description": "Learn advanced pattern recognition",
      "targetProficiency": 0.6
    }
  ]
}
```

### Agent Specialization Registration

```typescript
// Register agent specialization
POST /multi-agent/specialization/agents
{
  "agentId": "agent_123",
  "specializationId": "spec_456",
  "initialProficiency": 0.1,
  "capabilities": [
    {
      "name": "trend_identification",
      "proficiencyLevel": 0.2
    }
  ]
}

// Update agent proficiency
POST /multi-agent/specialization/agents/agent_spec_789/proficiency
{
  "proficiencyLevel": 0.4,
  "trainingContext": {
    "trainingDataset": "historical_eth_usdc_2023",
    "iterations": 1000
  },
  "evaluationMetrics": {
    "accuracy": 0.82,
    "profit_factor": 1.5
  },
  "achievement": {
    "name": "Trend Master Bronze",
    "description": "Successfully identified trends with >80% accuracy"
  }
}
```

### Finding Specialized Agents

```typescript
// Find specialized agents
GET /multi-agent/specialization/domains/spec_456/agents?minProficiency=0.3&requiredCapabilities=trend_identification,entry_exit_timing
```

## Performance Analytics

The analytics system provides insights into agent performance and learning progress.

### Telemetry

```typescript
// Record telemetry event
POST /analytics/telemetry/events
{
  "agentId": "agent_123",
  "eventType": "swap_execution",
  "timestamp": "2023-06-15T10:30:00Z",
  "data": {
    "fromToken": "ETH",
    "toToken": "USDC",
    "amount": "0.5",
    "executionTime": 1200,
    "slippage": 0.002
  }
}

// Get agent telemetry
GET /analytics/telemetry/agents/agent_123?eventType=swap_execution&timeframe=1d
```

### Benchmarks

```typescript
// Create benchmark
POST /analytics/benchmarks/create
{
  "name": "Trend Following Benchmark",
  "description": "Benchmark for trend following strategies",
  "metrics": ["profit_loss", "sharpe_ratio", "max_drawdown"],
  "baseline": {
    "profit_loss": 0.05,
    "sharpe_ratio": 1.0,
    "max_drawdown": 0.1
  }
}

// Run benchmark
POST /analytics/benchmarks/run
{
  "benchmarkId": "benchmark_123",
  "agentIds": ["agent_123", "agent_456"],
  "environment": "historical",
  "parameters": {
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-03-31T23:59:59Z",
    "initialCapital": 10000
  }
}

// Get benchmark results
GET /analytics/benchmarks/results/benchmark_123
```

### Learning Progress

```typescript
// Record learning progress
POST /analytics/learning-progress/record
{
  "agentId": "agent_123",
  "timestamp": "2023-06-15T10:30:00Z",
  "metrics": {
    "loss": 0.05,
    "accuracy": 0.85,
    "reward": 120.5
  },
  "iteration": 1000,
  "learningRate": 0.001
}

// Get learning progress
GET /analytics/learning-progress/agents/agent_123?metric=accuracy&timeframe=1w
```

## Best Practices

### Agent Design

1. **Modular Architecture**: Design agents with clear separation between observation processing, decision making, and action execution.

2. **Adaptive Learning Rate**: Implement dynamic learning rates that decrease as the agent becomes more proficient.

3. **Exploration vs. Exploitation**: Use techniques like epsilon-greedy or UCB to balance exploration and exploitation.

4. **Memory Management**: Implement experience replay buffers to improve learning efficiency.

5. **Multi-objective Optimization**: Consider multiple objectives (profit, risk, gas costs) in your reward function.

### Multi-Agent Systems

1. **Specialization**: Design agents to specialize in specific tasks rather than creating generalist agents.

2. **Hierarchical Organization**: Implement hierarchical structures with coordinator agents managing specialist agents.

3. **Knowledge Sharing**: Use shared memory spaces for efficient knowledge transfer between agents.

4. **Consensus Mechanisms**: Implement voting or weighted consensus for critical decisions.

5. **Diversity**: Maintain diversity in agent strategies to improve system robustness.

### Performance Optimization

1. **Batch Processing**: Process observations and actions in batches when possible.

2. **Caching**: Cache frequently accessed data to reduce API calls.

3. **Asynchronous Operations**: Use asynchronous operations for non-blocking agent behavior.

4. **Rate Limiting**: Implement adaptive rate limiting based on market conditions.

5. **Fallback Strategies**: Design fallback strategies for when primary approaches fail.

## Example Implementations

### Basic Trading Agent

```python
import requests
import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

class TradingAgent:
    def __init__(self, agent_id, api_key, base_url):
        self.agent_id = agent_id
        self.api_key = api_key
        self.base_url = base_url
        self.token = self.authenticate()
        self.model = self.build_model()
        self.scaler = StandardScaler()
        
    def authenticate(self):
        response = requests.post(
            f"{self.base_url}/agent/auth/login",
            json={"agentId": self.agent_id, "apiKey": self.api_key}
        )
        return response.json()["token"]
    
    def build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(3, activation='softmax')  # Buy, Hold, Sell
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy')
        return model
    
    def get_observation(self, symbol):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/agent/observation/market?symbols={symbol}",
            headers=headers
        )
        return response.json()
    
    def preprocess_observation(self, observation):
        # Extract features from observation
        features = [
            observation["price"],
            observation["volume"],
            observation["high24h"],
            observation["low24h"],
            # ... more features
        ]
        # Normalize features
        features = self.scaler.fit_transform([features])[0]
        return features
    
    def decide_action(self, features):
        prediction = self.model.predict(np.array([features]))[0]
        action_idx = np.argmax(prediction)
        if action_idx == 0:
            return "buy"
        elif action_idx == 2:
            return "sell"
        else:
            return "hold"
    
    def execute_action(self, action, symbol, amount):
        if action == "hold":
            return None
            
        headers = {"Authorization": f"Bearer {self.token}"}
        if action == "buy":
            response = requests.post(
                f"{self.base_url}/agent/action/swap",
                headers=headers,
                json={
                    "agentId": self.agent_id,
                    "fromToken": "USDC",
                    "toToken": symbol,
                    "amount": str(amount),
                    "maxSlippage": "0.01"
                }
            )
        else:  # sell
            response = requests.post(
                f"{self.base_url}/agent/action/swap",
                headers=headers,
                json={
                    "agentId": self.agent_id,
                    "fromToken": symbol,
                    "toToken": "USDC",
                    "amount": str(amount),
                    "maxSlippage": "0.01"
                }
            )
        return response.json()
    
    def get_reward(self, action_id):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/agent/reward/action/{action_id}",
            headers=headers
        )
        return response.json()["reward"]
    
    def learn(self, features, action_idx, reward):
        # Simple update using reward
        target = np.zeros((1, 3))
        target[0, action_idx] = reward
        self.model.fit(np.array([features]), target, epochs=1, verbose=0)
    
    def run_episode(self, symbol="ETH", amount=0.1, steps=100):
        total_reward = 0
        
        for _ in range(steps):
            # Get observation
            observation = self.get_observation(symbol)
            
            # Preprocess observation
            features = self.preprocess_observation(observation)
            
            # Decide action
            action = self.decide_action(features)
            
            # Execute action
            if action != "hold":
                result = self.execute_action(action, symbol, amount)
                action_id = result["actionId"]
                
                # Get reward
                reward = self.get_reward(action_id)
                total_reward += reward
                
                # Learn from experience
                action_idx = 0 if action == "buy" else 2
                self.learn(features, action_idx, reward)
            
        return total_reward

# Usage
agent = TradingAgent("agent_123", "your_api_key", "https://api.example.com")
reward = agent.run_episode()
print(f"Total reward: {reward}")
```

### Multi-Agent Coordination Example

```python
import requests
import numpy as np
import time

class CoordinatorAgent:
    def __init__(self, agent_id, api_key, base_url):
        self.agent_id = agent_id
        self.api_key = api_key
        self.base_url = base_url
        self.token = self.authenticate()
        self.pool_id = self.create_agent_pool()
        
    def authenticate(self):
        response = requests.post(
            f"{self.base_url}/agent/auth/login",
            json={"agentId": self.agent_id, "apiKey": self.api_key}
        )
        return response.json()["token"]
    
    def create_agent_pool(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/multi-agent/coordination/pools",
            headers=headers,
            json={
                "name": "Market Analysis Team",
                "description": "A team of specialized market analysis agents",
                "specializations": ["trend_analysis", "volatility_analysis", "sentiment_analysis"]
            }
        )
        return response.json()["poolId"]
    
    def add_agent_to_pool(self, agent_id, name, specializations):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/multi-agent/coordination/pools/agents",
            headers=headers,
            json={
                "poolId": self.pool_id,
                "agentId": agent_id,
                "name": name,
                "specializations": specializations
            }
        )
        return response.json()
    
    def create_task(self, name, description, required_specializations):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/multi-agent/coordination/tasks",
            headers=headers,
            json={
                "poolId": self.pool_id,
                "name": name,
                "description": description,
                "requiredSpecializations": required_specializations
            }
        )
        return response.json()["taskId"]
    
    def get_task_details(self, task_id):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/multi-agent/coordination/tasks/{task_id}",
            headers=headers
        )
        return response.json()
    
    def create_memory_space(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/multi-agent/shared-memory/spaces",
            headers=headers,
            json={
                "name": "Market Analysis Results",
                "description": "Shared memory for market analysis results",
                "createdBy": self.agent_id,
                "type": "analysis_results"
            }
        )
        return response.json()["spaceId"]
    
    def add_knowledge_entry(self, space_id, key, value, tags=None):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/multi-agent/shared-memory/entries",
            headers=headers,
            json={
                "spaceId": space_id,
                "agentId": self.agent_id,
                "key": key,
                "value": value,
                "tags": tags or []
            }
        )
        return response.json()
    
    def query_knowledge_entries(self, space_id, key_pattern=None, tags=None):
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {
            "agentId": self.agent_id
        }
        if key_pattern:
            params["keyPattern"] = key_pattern
        if tags:
            params["tags"] = tags
            
        response = requests.get(
            f"{self.base_url}/multi-agent/shared-memory/spaces/{space_id}/entries",
            headers=headers,
            params=params
        )
        return response.json()
    
    def coordinate_market_analysis(self, symbol):
        # Add specialist agents to pool
        self.add_agent_to_pool("trend_agent", "Trend Analyst", ["trend_analysis"])
        self.add_agent_to_pool("volatility_agent", "Volatility Analyst", ["volatility_analysis"])
        self.add_agent_to_pool("sentiment_agent", "Sentiment Analyst", ["sentiment_analysis"])
        
        # Create shared memory space
        space_id = self.create_memory_space()
        
        # Create analysis task
        task_id = self.create_task(
            f"Analyze {symbol} Market",
            f"Comprehensive analysis of {symbol} market conditions",
            ["trend_analysis", "volatility_analysis", "sentiment_analysis"]
        )
        
        # Wait for task completion (in a real system, this would be event-driven)
        task_completed = False
        while not task_completed:
            task_details = self.get_task_details(task_id)
            if task_details["status"] == "completed":
                task_completed = True
            else:
                time.sleep(5)
        
        # Analyze results
        results = self.query_knowledge_entries(space_id, key_pattern=f"{symbol}_analysis_.*")
        
        # Synthesize final analysis
        trend_analysis = next((r for r in results["entries"] if "trend" in r["tags"]), None)
        volatility_analysis = next((r for r in results["entries"] if "volatility" in r["tags"]), None)
        sentiment_analysis = next((r for r in results["entries"] if "sentiment" in r["tags"]), None)
        
        # Make decision based on combined analysis
        decision = self.synthesize_decision(trend_analysis, volatility_analysis, sentiment_analysis)
        
        # Store final decision
        self.add_knowledge_entry(
            space_id,
            f"{symbol}_final_decision_{int(time.time())}",
            decision,
            ["final_decision", symbol.lower()]
        )
        
        return decision
    
    def synthesize_decision(self, trend_analysis, volatility_analysis, sentiment_analysis):
        # Simple decision synthesis logic
        if not all([trend_analysis, volatility_analysis, sentiment_analysis]):
            return {"action": "hold", "confidence": 0.5, "reason": "Incomplete analysis"}
        
        trend_signal = trend_analysis["value"]["signal"]  # bullish, bearish, neutral
        volatility_level = volatility_analysis["value"]["level"]  # high, medium, low
        sentiment_score = sentiment_analysis["value"]["score"]  # -1.0 to 1.0
        
        # Decision logic
        if trend_signal == "bullish" and sentiment_score > 0.3:
            if volatility_level == "low":
                action = "buy"
                confidence = 0.8
                reason = "Strong bullish trend with positive sentiment and low volatility"
            else:
                action = "buy"
                confidence = 0.6
                reason = "Bullish trend with positive sentiment but higher volatility"
        elif trend_signal == "bearish" and sentiment_score < -0.3:
            if volatility_level == "low":
                action = "sell"
                confidence = 0.8
                reason = "Strong bearish trend with negative sentiment and low volatility"
            else:
                action = "sell"
                confidence = 0.6
                reason = "Bearish trend with negative sentiment but higher volatility"
        else:
            action = "hold"
            confidence = 0.5
            reason = "Mixed signals or neutral market conditions"
            
        return {
            "action": action,
            "confidence": confidence,
            "reason": reason,
            "components": {
                "trend": trend_analysis["value"],
                "volatility": volatility_analysis["value"],
                "sentiment": sentiment_analysis["value"]
            }
        }

# Usage
coordinator = CoordinatorAgent("coordinator_agent", "your_api_key", "https://api.example.com")
decision = coordinator.coordinate_market_analysis("ETH")
print(f"Decision: {decision['action']} (Confidence: {decision['confidence']})")
print(f"Reason: {decision['reason']}")
```

## Conclusion

The Agent-Centric Meta Swap API provides a comprehensive platform for developing, training, and deploying autonomous self-learning AI agents in the DeFi space. By leveraging the observation space, action space, reward system, learning environment, and multi-agent coordination features, developers can create sophisticated agent systems that continuously improve through experience.

For additional support or questions, please contact the platform administrators or refer to the API documentation.
