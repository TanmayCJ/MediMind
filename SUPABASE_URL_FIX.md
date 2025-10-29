# Fix Email Verification Links

The email verification links are pointing to localhost. Follow these steps to fix:

## Step 1: Update Supabase URL Configuration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your MediMind project
3. Navigate to: **Authentication** → **URL Configuration**
4. Update these settings:

### Site URL
```
https://medimind-alpha.web.app
```

### Redirect URLs (Add these)
```
https://medimind-alpha.web.app/**
https://medimind-alpha.web.app/auth/callback
https://medimind-alpha.web.app/dashboard
```

## Step 2: Email Templates (Optional but Recommended)

In **Authentication** → **Email Templates**, you can customize the email messages to include your app name "MediMind AI"

## Step 3: Test the Fix

1. Sign up with a new email address
2. Check the email - the link should now point to `https://medimind-alpha.web.app`
3. Click the link to verify your email
4. You should be redirected to the live site and be able to sign in

## Important Notes

- Old verification emails will still point to localhost
- New verification emails will use the production URL
- Users with unverified emails will need to request a new verification email
- You can resend verification emails from the Supabase Auth dashboard if needed

## Verification Link Format

After the fix, verification links should look like:
```
https://medimind-alpha.web.app/auth/confirm?token=...&type=signup
```

Instead of:
```
localhost:8080/#error=access_denied&error_code=otp_expired...
```
