# ProGuard/R8 configuration for Spy Game

# Keep all custom classes for debugging (remove in production if needed)
-keep class com.anonymous.spygame.** { *; }

# Keep all classes from React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep JavaScript interface classes
-keep class com.facebook.react.bridge.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }

# Keep Android support library classes
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimization settings
-optimizationpasses 5
-dontobfuscate

# Keep BuildConfig
-keep class **.BuildConfig { *; }

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

# SQLite
-keep class android.database.sqlite.** { *; }

# Disable obfuscation for debugging
-dontusemixedcaseclassnames

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Preserve line numbers for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
