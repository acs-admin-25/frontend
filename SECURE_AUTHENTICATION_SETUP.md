# 🔐 Secure Authentication Setup Guide

## Overview
This guide explains how to set up secure authentication between your frontend and Google Cloud Functions, replacing the current 403 errors with proper service account authentication.

## 🎯 Current Problem
- Cloud Functions return 403 Forbidden errors
- Frontend cannot authenticate with Cloud Functions
- Need to implement secure authentication instead of public access

## 📋 Prerequisites
- Google Cloud Console access
- Frontend project running locally
- Service account: `auth-functions-dev@acs-dev-464702.iam.gserviceaccount.com` (already exists)

## 🚀 Step-by-Step Setup

### Step 1: Add Cloud Functions Invoker Role (2 minutes)

1. **Go to Google Cloud Console**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com)
   - Select project: `acs-dev-464702`

2. **Access IAM Settings**
   - Go to **IAM & Admin** → **IAM**
   - Look for the service account: `auth-functions-dev@acs-dev-464702.iam.gserviceaccount.com`

3. **Grant Access**
   - Click **"GRANT ACCESS"** button
   - In **"New principals"** field, enter: `auth-functions-dev@acs-dev-464702.iam.gserviceaccount.com`
   - Click **"SELECT A ROLE"**
   - Search for and select: **"Cloud Functions Invoker"**
   - Click **"SAVE"**

### Step 2: Create Service Account Key (1 minute)

1. **Go to Credentials**
   - Navigate to **APIs & Services** → **Credentials**
   - Click on **"auth-functions-dev@acs-dev-464702.iam.gserviceaccount.com"**

2. **Create Key**
   - Go to **"Keys"** tab
   - Click **"CREATE NEW KEY"**
   - Select **"JSON"** format
   - Click **"CREATE"**
   - **Download the JSON file** (save it securely)

### Step 3: Add Key to Frontend Environment (2 minutes)

1. **Create Environment File**
   ```bash
   # In your frontend directory
   touch .env.local
   ```

2. **Add Service Account Key**
   ```bash
   # Open .env.local and add:
   GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"acs-dev-464702",...}'
   ```
   - Paste the entire JSON content from the downloaded key file
   - Make sure to include all the JSON content between single quotes

3. **Restart Frontend Server**
   ```bash
   npm run dev
   ```

### Step 4: Install Required Package (1 minute)

```bash
npm install google-auth-library
```

### Step 5: Update Frontend Code (5 minutes)

The following files will be updated to use authenticated requests:

1. **`lib/auth/google-auth.ts`** - Authentication utility (already created)
2. **`app/api/auth/login/route.ts`** - Updated to use authenticated fetch
3. **`app/api/auth/signup/route.ts`** - Updated to use authenticated fetch
4. **`lib/auth/auth-options.ts`** - Updated for Google OAuth

### Step 6: Test Authentication (1 minute)

1. **Start Frontend**
   ```bash
   npm run dev
   ```

2. **Test Login/Signup**
   - Go to `/login` or `/signup`
   - Try to authenticate
   - Should work without 403 errors

## 🔍 Verification Steps

### Check IAM Permissions
- Go to **IAM & Admin** → **IAM**
- Verify `auth-functions-dev@acs-dev-464702.iam.gserviceaccount.com` has **"Cloud Functions Invoker"** role

### Check Service Account Key
- Go to **APIs & Services** → **Credentials**
- Click on the service account
- Go to **"Keys"** tab
- Should see one active JSON key

### Check Environment Variable
```bash
# In frontend directory
echo $GOOGLE_SERVICE_ACCOUNT_KEY
# Should show the JSON content
```

## 🛠️ Troubleshooting

### 403 Errors Still Occur
- Verify IAM role is added correctly
- Check service account key is in `.env.local`
- Restart frontend server after adding environment variable

### Authentication Errors
- Verify JSON key format in environment variable
- Check that `google-auth-library` is installed
- Review console logs for specific error messages

### Environment Variable Issues
- Make sure `.env.local` is in the frontend root directory
- Verify JSON is properly quoted in the environment variable
- Restart the development server after changes

## 🔒 Security Notes

- **Never commit** the service account key to version control
- **Keep the JSON key file** secure and private
- **Rotate keys** periodically for security
- **Use environment variables** for all sensitive data

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Cloud Console logs
3. Check frontend console for error messages
4. Verify all steps were completed correctly

## ✅ Completion Checklist

- [ ] Cloud Functions Invoker role added to service account
- [ ] Service account key created and downloaded
- [ ] Environment variable added to `.env.local`
- [ ] `google-auth-library` package installed
- [ ] Frontend code updated for authenticated requests
- [ ] Frontend server restarted
- [ ] Login/signup tested successfully
- [ ] No more 403 errors

---

**Total Estimated Time: 10-15 minutes**

Once completed, your frontend will have secure, authenticated access to your Cloud Functions! 🎉 