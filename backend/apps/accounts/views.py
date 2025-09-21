from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils.crypto import get_random_string
import json
from urllib.request import urlopen
from urllib.error import URLError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
from .models import PasswordResetOTP, UserProfile


class CustomPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    """Custom token generator with 10 minutes expiration."""
    
    def _make_hash_value(self, user, timestamp):
        # Include timestamp in hash for expiration check
        return f"{user.pk}{user.password}{timestamp}"
    
    def check_token(self, user, token):
        """
        Check that a password reset token is correct for a given user.
        Override to add 10-minute expiration.
        """
        if not (user and token):
            return False
        
        try:
            ts_b36, hash = token.split("-")
        except ValueError:
            return False
        
        try:
            ts = int(ts_b36, 36)
        except ValueError:
            return False
        
        # Check if token is expired (10 minutes = 600 seconds)
        if timezone.now().timestamp() - ts > 600:
            return False
        
        # Check the token
        if not self._make_hash_value(user, ts) == hash:
            return False
        
        return True


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class EmailTokenObtainPairView(TokenObtainPairView):
    """Allow login with email+password in addition to username+password.

    POST body can be either {username, password} or {email, password}.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        email = data.get('email')
        if email and not data.get('username'):
            try:
                user = User.objects.get(email__iexact=str(email).strip())
                data['username'] = user.username
            except User.DoesNotExist:
                return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    """Verify Google ID token, create/get user by email, issue JWT tokens.

    Request: { id_token: string }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'detail': 'id_token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify via Google tokeninfo endpoint (simple server-side check)
        tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        try:
            with urlopen(tokeninfo_url) as resp:
                payload = json.loads(resp.read().decode('utf-8'))
        except URLError:
            return Response({'detail': 'Unable to verify Google token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response({'detail': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

        # Basic validations
        email = payload.get('email')
        email_verified = payload.get('email_verified') in (True, 'true', 'True', '1', 1)
        aud = payload.get('aud')
        allowed_auds = getattr(settings, 'GOOGLE_CLIENT_IDS', None)
        if allowed_auds and aud not in allowed_auds:
            return Response({'detail': 'Invalid Google client'}, status=status.HTTP_401_UNAUTHORIZED)
        if not email or not email_verified:
            return Response({'detail': 'Email not verified by Google'}, status=status.HTTP_401_UNAUTHORIZED)

        # Create or get user by email
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            base_username = email.strip().lower()
            username = base_username
            attempts = 0
            while User.objects.filter(username=username).exists():
                attempts += 1
                username = f"{base_username}-{get_random_string(6)}"
                if attempts > 5:
                    username = f"user-{get_random_string(12)}"
                    break
            given_name = payload.get('given_name') or ''
            family_name = payload.get('family_name') or ''
            user = User.objects.create(username=username, email=email, first_name=given_name[:30], last_name=family_name[:150])
            user.set_unusable_password()
            user.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request a password reset link by email.

    Body: { email: string }
    Response: { detail: string } (and in dev, includes reset_url for convenience)
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        # Do not reveal whether email exists
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = CustomPasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # Build reset link (frontend route expected)
            frontend_base = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
            reset_url = f"{frontend_base}/reset-password?uid={uid}&token={token}"
            try:
                send_mail(
                    subject='Password reset instructions',
                    message=f"Open this link to reset your password: {reset_url}",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
                    recipient_list=[email],
                    fail_silently=True,
                )
            except Exception:
                pass
            # In development, return the URL for convenience
            if settings.DEBUG:
                return Response({'detail': 'If an account exists, a reset email was sent.', 'reset_url': reset_url})
        return Response({'detail': 'If an account exists, a reset email was sent.'})


class PasswordResetConfirmView(APIView):
    """Confirm password reset using uid + token.

    Body: { uid: string, token: string, new_password: string }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        if not uid or not token or not new_password:
            return Response({'detail': 'uid, token and new_password are required'}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({'detail': 'Invalid link'}, status=400)

        if not CustomPasswordResetTokenGenerator().check_token(user, token):
            return Response({'detail': 'Invalid or expired token'}, status=400)

        if len(new_password) < 8:
            return Response({'detail': 'Password must be at least 8 characters'}, status=400)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password has been reset successfully'})



class PasswordResetOTPRequestView(APIView):
    """Request a 6-digit OTP to reset password. Body: { email }"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        # Don't reveal whether user exists
        if user:
            import random
            code = f"{random.randint(0, 999999):06d}"
            expires_at = timezone.now() + timezone.timedelta(minutes=10)
            PasswordResetOTP.objects.create(email=email, code=code, expires_at=expires_at)
            try:
                send_mail(
                    subject='Your password reset OTP',
                    message=f"Use this OTP to reset your password: {code}\nIt expires in 10 minutes.",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
                    recipient_list=[email],
                    fail_silently=True,
                )
            except Exception:
                pass
        return Response({'detail': 'If an account exists, an OTP was sent.'})


class PasswordResetOTPVerifyView(APIView):
    """Verify OTP and set a short-lived session token to allow resetting.

    Body: { email, code }
    Response: { token }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        now = timezone.now()
        otp = PasswordResetOTP.objects.filter(email__iexact=email, code=code, used=False, expires_at__gt=now).order_by('-created_at').first()
        if not otp:
            return Response({'detail': 'Invalid or expired OTP'}, status=400)
        # issue a temporary token (random string) valid for 10 minutes; store in OTP row
        session_token = get_random_string(32)
        otp.code = session_token
        otp.expires_at = now + timezone.timedelta(minutes=10)
        otp.save(update_fields=['code', 'expires_at'])
        return Response({'token': session_token})


class PasswordResetWithOTPConfirmView(APIView):
    """Reset password using email + temporary token from OTP verify.

    Body: { email, token, new_password }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        token = (request.data.get('token') or '').strip()
        new_password = (request.data.get('new_password') or '').strip()
        if not email or not token or not new_password:
            return Response({'detail': 'email, token and new_password are required'}, status=400)
        if len(new_password) < 8:
            return Response({'detail': 'Password must be at least 8 characters'}, status=400)
        now = timezone.now()
        otp = PasswordResetOTP.objects.filter(email__iexact=email, code=token, used=False, expires_at__gt=now).first()
        if not otp:
            return Response({'detail': 'Invalid or expired token'}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'detail': 'Invalid account'}, status=400)
        user.set_password(new_password)
        user.save(update_fields=['password'])
        otp.used = True
        otp.save(update_fields=['used'])
        return Response({'detail': 'Password has been reset successfully'})


class UsersSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get('q') or '').strip()
        qs = User.objects.filter(is_active=True).exclude(email__isnull=True).exclude(email__exact='')
        if q:
            # Prefer email prefix; also allow name/username prefix, but only users with an email
            qs = qs.filter(
                Q(email__istartswith=q) |
                Q(first_name__istartswith=q) |
                Q(last_name__istartswith=q) |
                Q(username__istartswith=q)
            )
        qs = qs.order_by('email', 'first_name', 'last_name')[:20]
        data = [
            {
                'id': u.id,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'name': (f"{u.first_name} {u.last_name}".strip() or u.email or u.username),
            }
            for u in qs
        ]
        return Response({'results': data})


class DeleteAccountView(APIView):
    """Delete the authenticated user's account and all associated data."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        
        # Delete all user-related data
        # This will cascade delete projects, tasks, comments, etc. due to foreign key relationships
        user.delete()
        
        return Response({'detail': 'Account deleted successfully'}, status=status.HTTP_200_OK)


class NotificationSettingsView(APIView):
    """Get and update user notification preferences."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current notification settings for the user."""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update notification settings for the user."""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoNotDisturbView(APIView):
    """Enable/disable Do Not Disturb for a specific duration."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Enable Do Not Disturb for a specified duration."""
        duration_minutes = request.data.get('duration_minutes')
        
        if not duration_minutes:
            return Response({'detail': 'duration_minutes is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate duration options
        valid_durations = [20, 60, 240, 1440, 2880, 10080]  # 20min, 1hr, 4hr, 24hr, 2days, 1week
        if duration_minutes not in valid_durations:
            return Response({'detail': 'Invalid duration'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        # Calculate end time
        end_time = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        
        # Update Do Not Disturb settings
        profile.do_not_disturb_enabled = True
        profile.do_not_disturb_until = end_time
        profile.save()
        
        serializer = UserProfileSerializer(profile)
        return Response({
            'detail': f'Do Not Disturb enabled for {duration_minutes} minutes',
            'profile': serializer.data
        })
    
    def delete(self, request):
        """Disable Do Not Disturb."""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        profile.do_not_disturb_enabled = False
        profile.do_not_disturb_until = None
        profile.save()
        
        serializer = UserProfileSerializer(profile)
        return Response({
            'detail': 'Do Not Disturb disabled',
            'profile': serializer.data
        })


class ChangePasswordView(APIView):
    """Change user password."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password."""
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({'detail': 'current_password and new_password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({'detail': 'New password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Check current password
        if not user.check_password(current_password):
            return Response({'detail': 'The current password entered is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'detail': 'Password has been updated successfully'})


class OTPLoginRequestView(APIView):
    """Request a 6-digit OTP for quick login. Body: { email }"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        # Don't reveal whether user exists
        if user:
            import random
            code = f"{random.randint(0, 999999):06d}"
            expires_at = timezone.now() + timezone.timedelta(minutes=5)  # 5 minutes for login OTP
            PasswordResetOTP.objects.create(email=email, code=code, expires_at=expires_at)
            try:
                send_mail(
                    subject='Your login OTP',
                    message=f"Use this OTP to login: {code}\nIt expires in 5 minutes.",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
                    recipient_list=[email],
                    fail_silently=True,
                )
                print(f"OTP sent to {email}: {code}")  # Debug print
            except Exception as e:
                print(f"Email sending failed: {e}")  # Debug print
                pass
        # In development, return the OTP for testing
        if settings.DEBUG and user:
            return Response({'detail': 'If an account exists, an OTP was sent.', 'otp': code})
        return Response({'detail': 'If an account exists, an OTP was sent.'})


class OTPLoginVerifyView(APIView):
    """Verify OTP and login user directly. Body: { email, code }"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        now = timezone.now()
        
        otp = PasswordResetOTP.objects.filter(
            email__iexact=email, 
            code=code, 
            used=False, 
            expires_at__gt=now
        ).order_by('-created_at').first()
        
        if not otp:
            return Response({'detail': 'Invalid or expired OTP'}, status=400)
        
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'detail': 'Invalid account'}, status=400)
        
        # Mark OTP as used
        otp.used = True
        otp.save(update_fields=['used'])
        
        # Generate JWT tokens for login
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token), 
            'refresh': str(refresh),
            'detail': 'Login successful'
        })
