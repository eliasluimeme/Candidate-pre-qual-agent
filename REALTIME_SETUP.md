# Real-time Updates Implementation Guide

## Overview
This dashboard implements real-time updates using Supabase's real-time subscriptions. When data changes in the database, the UI automatically updates without requiring a page refresh.

## How It Works

### 1. Custom Hook (`hooks/use-realtime.ts`)
- Manages Supabase real-time subscriptions
- Handles connection status tracking
- Provides cleanup on component unmount
- Supports multiple tables in a single subscription

### 2. Components Using Real-time
- **ApplicationsGrid**: Updates when applications or application_steps change
- **DashboardStats**: Updates statistics when data changes
- **RealtimeTest**: Test component for debugging

## Setup Requirements

### 1. Database Configuration
Ensure your Supabase database has:
- Row Level Security (RLS) enabled
- Proper read policies for anonymous users
- Real-time enabled for tables

```sql
-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_steps ENABLE ROW LEVEL SECURITY;

-- Create read policies
CREATE POLICY "Enable read access for all users" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON application_steps FOR SELECT USING (true);
```

### 2. Supabase Project Settings
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Ensure "Enable Realtime" is turned on
4. Add your tables to the realtime publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE applications;
   ALTER PUBLICATION supabase_realtime ADD TABLE application_steps;
   ```

### 3. Environment Variables
Ensure these are set in your `.env` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing Real-time Updates

### 1. Using the Test Component
The `RealtimeTest` component provides buttons to:
- Create new applications
- Update existing applications
- Watch for real-time changes

### 2. Manual Testing
1. Open the dashboard in two browser tabs
2. Use the SQL editor in Supabase to modify data
3. Watch both tabs update automatically

### 3. Console Logging
Check browser console for:
- Connection status messages
- Real-time payload logs
- Subscription status updates

## Troubleshooting

### Common Issues

1. **No Real-time Updates**
   - Check if RLS policies allow reading
   - Verify tables are in realtime publication
   - Ensure environment variables are correct

2. **Connection Status "Disconnected"**
   - Check network connectivity
   - Verify Supabase project is active
   - Check browser console for errors

3. **Partial Updates**
   - Ensure both tables are in subscription
   - Check for JavaScript errors in console
   - Verify data transformation logic

### Debug Steps

1. **Check Subscription Status**
   ```javascript
   // Look for these console messages:
   // "Subscription status: SUBSCRIBED"
   // "Real-time change in applications: ..."
   ```

2. **Verify Database Policies**
   ```sql
   -- Test if you can read data
   SELECT * FROM applications LIMIT 1;
   SELECT * FROM application_steps LIMIT 1;
   ```

3. **Test Connection**
   ```javascript
   // In browser console:
   const { createClient } = window.supabase;
   const supabase = createClient(url, key);
   supabase.from('applications').select('*').limit(1);
   ```

## Performance Considerations

### 1. Subscription Management
- Use the `useRealtime` hook to prevent duplicate subscriptions
- Subscriptions are automatically cleaned up on component unmount
- Each component gets its own channel to avoid conflicts

### 2. Data Fetching
- Real-time updates trigger full data refetch
- Consider implementing incremental updates for large datasets
- Use `useCallback` to prevent unnecessary re-subscriptions

### 3. Connection Status
- Display connection status to users
- Handle disconnection gracefully
- Provide manual refresh options

## Advanced Features

### 1. Selective Updates
Modify the hook to handle specific events:
```javascript
// Only listen for INSERT and UPDATE events
event: ['INSERT', 'UPDATE']
```

### 2. Filtered Subscriptions
Add filters to subscriptions:
```javascript
// Only listen for specific rows
filter: 'current_step=eq.1'
```

### 3. Optimistic Updates
Update UI immediately, then sync with server:
```javascript
// Update local state first
setData(optimisticData);
// Then sync with server
await supabase.from('table').update(data);
```

## Security Notes

- Never expose service role keys in client-side code
- Use RLS policies to control data access
- Validate all data on the server side
- Consider rate limiting for real-time updates

## Monitoring

### 1. Connection Health
- Monitor connection status in production
- Log disconnection events
- Implement reconnection strategies

### 2. Performance Metrics
- Track subscription setup time
- Monitor data fetch frequency
- Measure UI update responsiveness

### 3. Error Handling
- Log real-time errors
- Provide fallback data loading
- Handle network failures gracefully 