# Fly.io Deployment Guide

This guide covers deploying the Notion PDF Exporter server to fly.io.

## Prerequisites

1. **Install flyctl CLI**
   ```bash
   # macOS
   brew install flyctl

   # Or via install script
   curl -L https://fly.io/install.sh | sh
   ```

2. **Authenticate with fly.io**
   ```bash
   fly auth login
   ```

3. **Generate a strong SESSION_SECRET**
   ```bash
   openssl rand -base64 32
   ```

## Initial Setup

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Create the App (First Time Only)
```bash
# This will create the app based on your fly.toml
fly apps create notion-pdf-exporter

# Or let fly.io generate a name
fly apps create
```

### 3. Set Environment Secrets

**REQUIRED** - Set all required secrets:

```bash
# Session secret (generate with: openssl rand -base64 32)
fly secrets set SESSION_SECRET="your-strong-random-secret-here"

# Notion OAuth credentials
fly secrets set NOTION_CLIENT_ID="your-notion-client-id"
fly secrets set NOTION_CLIENT_SECRET="your-notion-client-secret"

# Redirect URI (use your fly.io app URL)
fly secrets set NOTION_REDIRECT_URI="https://notion-pdf-exporter.fly.dev/api/auth/notion/callback"

# Client URL (your frontend URL, comma-separated for multiple)
fly secrets set CLIENT_URL="https://your-frontend-url.com"
```

### 4. Configure fly.toml

Edit `fly.toml` to customize:

- **app**: Your app name (must match the app created in step 2)
- **primary_region**: Your preferred region (see available regions: `fly platform regions`)
- **memory_mb**: Increase if you're generating large PDFs (512MB should be sufficient for most use cases)

### 5. Update Notion OAuth Settings

In your Notion integration settings (https://www.notion.so/my-integrations):

1. **Redirect URIs**: Add your fly.io callback URL
   ```
   https://your-app-name.fly.dev/api/auth/notion/callback
   ```

2. **Website URL**: Add your frontend URL
   ```
   https://your-frontend-url.com
   ```

## Deployment

### Deploy the Application

```bash
# From the server directory
fly deploy

# To deploy and open in browser
fly deploy --open
```

### Monitor Deployment

```bash
# View deployment status
fly status

# View logs (real-time)
fly logs

# View specific machine logs
fly logs --machine <machine-id>
```

## Post-Deployment

### Verify Deployment

1. **Health Check**
   ```bash
   curl https://your-app-name.fly.dev/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **View App Info**
   ```bash
   fly info
   ```

3. **Open App in Browser**
   ```bash
   fly open
   ```

### Test OAuth Flow

1. Navigate to your frontend
2. Click "Connect with Notion"
3. Verify redirect to Notion OAuth
4. Verify callback redirects back to frontend

## Scaling and Resources

### Manual Scaling

```bash
# Scale to specific number of machines
fly scale count 2

# Scale memory
fly scale memory 1024

# Scale CPU
fly scale vm shared-cpu-2x
```

### Auto-scaling

The default `fly.toml` configuration includes:
- **auto_stop_machines**: Machines stop when idle
- **auto_start_machines**: Machines start on request
- **min_machines_running**: 0 (scale to zero)

This is cost-effective for beta testing but may cause cold starts. For production:

```toml
[http_service]
  min_machines_running = 1  # Keep at least 1 machine running
```

## Monitoring and Debugging

### View Logs

```bash
# Real-time logs
fly logs

# Filter by level
fly logs --only error

# Follow specific machine
fly logs --machine <machine-id>
```

### SSH into Machine

```bash
# SSH into a running machine
fly ssh console

# Run a command
fly ssh console -C "node -v"
```

### Check Resource Usage

```bash
# View metrics
fly metrics

# View machine status
fly machine status
```

## Environment Variables

Current environment setup:

| Variable | Set Via | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | fly.toml | Yes | Should be "production" |
| `PORT` | fly.toml | Yes | Internal port (3000) |
| `SESSION_SECRET` | secrets | Yes | Session encryption key |
| `NOTION_CLIENT_ID` | secrets | Yes | Notion OAuth client ID |
| `NOTION_CLIENT_SECRET` | secrets | Yes | Notion OAuth client secret |
| `NOTION_REDIRECT_URI` | secrets | Yes | OAuth callback URL |
| `CLIENT_URL` | secrets | Yes | Frontend URL(s) for CORS |

### View Current Secrets

```bash
# List secret names (values are hidden)
fly secrets list
```

### Update Secrets

```bash
# Update a secret (triggers redeploy)
fly secrets set SESSION_SECRET="new-secret-value"

# Remove a secret
fly secrets unset SECRET_NAME
```

## Troubleshooting

### Common Issues

#### 1. Out of Memory (OOM) Errors

**Symptoms**: App crashes with OOM errors during PDF generation

**Solution**: Increase memory allocation
```bash
fly scale memory 1024
```

Or update `fly.toml`:
```toml
[[vm]]
  memory_mb = 1024
```

#### 2. Puppeteer/Chrome Crashes

**Symptoms**: "Failed to launch browser" or Chrome crashes

**Solution**: Ensure Dockerfile includes all Chromium dependencies (already included in provided Dockerfile)

#### 3. CORS Errors

**Symptoms**: Frontend can't connect to backend

**Solution**: Verify `CLIENT_URL` secret includes your frontend URL
```bash
fly secrets set CLIENT_URL="https://your-frontend.com,http://localhost:5173"
```

#### 4. OAuth Callback Fails

**Symptoms**: Notion OAuth fails after authentication

**Solution**:
1. Verify `NOTION_REDIRECT_URI` matches Notion integration settings
2. Check that it includes the full path: `https://your-app.fly.dev/api/auth/notion/callback`
3. Ensure it's added to Notion integration's allowed redirect URIs

#### 5. Cold Start Delays

**Symptoms**: First request takes 30+ seconds

**Solution**: Keep at least one machine running
```bash
fly scale count 1 --max-per-region=1
```

Or update `fly.toml`:
```toml
[http_service]
  min_machines_running = 1
```

### Debug Commands

```bash
# Check current configuration
fly config show

# Validate fly.toml
fly config validate

# View full machine details
fly machine list

# Restart all machines
fly machine restart
```

## Costs

Fly.io pricing (as of 2024):
- **Free tier**: Includes some compute and bandwidth
- **Shared CPU (256MB)**: ~$2-3/month if always running
- **Auto-stop (scale to zero)**: Pay only when running
- **Bandwidth**: First 100GB free, then ~$0.02/GB

For beta testing, the default auto-stop configuration keeps costs minimal.

## Updating the Application

### Code Changes

```bash
# Make code changes locally
# Commit to git (optional but recommended)

# Deploy updated code
cd server
fly deploy
```

### Configuration Changes

```bash
# Update fly.toml
# Deploy with new configuration
fly deploy
```

### Secret Changes

```bash
# Update secrets (triggers automatic redeploy)
fly secrets set SECRET_NAME="new-value"
```

## Multi-Region Deployment (Optional)

For global users, deploy to multiple regions:

```bash
# Add regions
fly regions add lax sea ord iad lhr

# View current regions
fly regions list

# Remove regions
fly regions remove lax
```

Update `fly.toml`:
```toml
primary_region = "sjc"  # Primary region for writes

[http_service]
  min_machines_running = 1  # Per region
```

## Rollback

If a deployment fails:

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback
```

## Cleanup

### Destroy App (Permanent)

```bash
# Delete the entire app (cannot be undone)
fly apps destroy notion-pdf-exporter
```

### Stop Without Deleting

```bash
# Stop all machines
fly machine stop --all

# Scale to zero
fly scale count 0
```

## Next Steps

1. Monitor logs for first few hours after deployment
2. Test all endpoints (health, OAuth, PDF generation)
3. Load test with realistic PDF sizes
4. Set up monitoring/alerting (consider Sentry integration from Phase 2 audit)
5. Configure custom domain (optional)

## Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Fly.io Regions](https://fly.io/docs/reference/regions/)
- [Fly.io Secrets](https://fly.io/docs/reference/secrets/)
