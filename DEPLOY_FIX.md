# Deploy Updated Function

The function has been updated to use `gemini-1.5-flash` instead of `gemini-2.0-flash-exp` for better quota availability.

## Manual Deployment via Supabase Dashboard

Since CLI has network issues, deploy manually:

1. **Go to:** https://supabase.com/dashboard/project/flltbxgderyvvpphdrwb/functions

2. **Click** on the `generate-summary` function (or create new if it doesn't exist)

3. **Replace the entire code** with the contents of:
   `supabase/functions/generate-summary/index.ts`

4. **Click "Deploy"**

## Or Try CLI Again (if network improves)

```powershell
npx supabase functions deploy generate-summary --project-ref flltbxgderyvvpphdrwb
```

## What Changed?

Changed model from `gemini-2.0-flash-exp` to `gemini-1.5-flash` for:
- ✅ Better quota availability on free tier
- ✅ More stable API limits
- ✅ Same quality analysis

After deployment, try uploading a report again!
