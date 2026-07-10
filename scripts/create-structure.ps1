$root = "c:\Users\USER\Desktop\Topnet_CRM_Test"

$dirs = @(
    # Documentation
    "docs/architecture",
    "docs/api",
    "docs/deployment",

    # Docker & Infrastructure
    "docker/nginx/conf.d",
    "docker/nginx/ssl",
    "docker/postgres/init",
    "docker/backend",
    "docker/frontend",

    # Backend - Global layers
    "backend/src/main/java/com/topnet/crm/config",
    "backend/src/main/java/com/topnet/crm/shared/domain",
    "backend/src/main/java/com/topnet/crm/shared/exception",
    "backend/src/main/java/com/topnet/crm/shared/util",
    "backend/src/main/java/com/topnet/crm/shared/logging",
    "backend/src/main/java/com/topnet/crm/shared/validation",
    "backend/src/main/java/com/topnet/crm/shared/constant",

    # Backend - Infrastructure (cross-cutting)
    "backend/src/main/java/com/topnet/crm/infrastructure/persistence/config",
    "backend/src/main/java/com/topnet/crm/infrastructure/persistence/auditing",
    "backend/src/main/java/com/topnet/crm/infrastructure/persistence/converter",
    "backend/src/main/java/com/topnet/crm/infrastructure/security/jwt",
    "backend/src/main/java/com/topnet/crm/infrastructure/security/config",
    "backend/src/main/java/com/topnet/crm/infrastructure/security/filter",
    "backend/src/main/java/com/topnet/crm/infrastructure/security/service",
    "backend/src/main/java/com/topnet/crm/infrastructure/messaging",
    "backend/src/main/java/com/topnet/crm/infrastructure/actuator",
    "backend/src/main/java/com/topnet/crm/infrastructure/openapi",

    # Backend - API layer (global)
    "backend/src/main/java/com/topnet/crm/api/rest/advice",
    "backend/src/main/java/com/topnet/crm/api/rest/health",

    # Backend - Application ports (hexagonal)
    "backend/src/main/java/com/topnet/crm/application/port/in",
    "backend/src/main/java/com/topnet/crm/application/port/out",

    # Backend - Resources
    "backend/src/main/resources/db/migration",
    "backend/src/main/resources/static",
    "backend/src/main/resources/templates",

    # Backend - Tests
    "backend/src/test/java/com/topnet/crm/integration",
    "backend/src/test/java/com/topnet/crm/unit/shared",
    "backend/src/test/java/com/topnet/crm/architecture",
    "backend/src/test/resources",

    # Frontend - Root
    "frontend/public",
    "frontend/src/assets/i18n",
    "frontend/src/assets/images",
    "frontend/src/assets/icons",
    "frontend/src/environments",
    "frontend/src/styles/themes",
    "frontend/src/styles/components",

    # Frontend - Core
    "frontend/src/app/core/auth/guards",
    "frontend/src/app/core/auth/interceptors",
    "frontend/src/app/core/auth/services",
    "frontend/src/app/core/auth/models",
    "frontend/src/app/core/config",
    "frontend/src/app/core/services",
    "frontend/src/app/core/models",
    "frontend/src/app/core/error-handling",

    # Frontend - Shared
    "frontend/src/app/shared/components/ui",
    "frontend/src/app/shared/components/forms",
    "frontend/src/app/shared/components/data-display",
    "frontend/src/app/shared/components/feedback",
    "frontend/src/app/shared/directives",
    "frontend/src/app/shared/pipes",
    "frontend/src/app/shared/models",
    "frontend/src/app/shared/utils",
    "frontend/src/app/shared/validators",

    # Frontend - Layout
    "frontend/src/app/layout/main-layout",
    "frontend/src/app/layout/auth-layout",
    "frontend/src/app/layout/components/header",
    "frontend/src/app/layout/components/sidebar",
    "frontend/src/app/layout/components/footer",
    "frontend/src/app/layout/components/breadcrumb",

    # Frontend - Features (each with data-access, ui, pages)
    "frontend/src/app/features/auth/data-access/services",
    "frontend/src/app/features/auth/data-access/models",
    "frontend/src/app/features/auth/ui/components",
    "frontend/src/app/features/auth/pages/login",
    "frontend/src/app/features/auth/pages/forgot-password",
    "frontend/src/app/features/auth/pages/reset-password",

    "frontend/src/app/features/dashboard/data-access/services",
    "frontend/src/app/features/dashboard/data-access/models",
    "frontend/src/app/features/dashboard/ui/components",
    "frontend/src/app/features/dashboard/pages/dashboard-home",

    "frontend/src/app/features/accounts/data-access/services",
    "frontend/src/app/features/accounts/data-access/models",
    "frontend/src/app/features/accounts/ui/components",
    "frontend/src/app/features/accounts/pages/account-list",
    "frontend/src/app/features/accounts/pages/account-detail",
    "frontend/src/app/features/accounts/pages/account-form",

    "frontend/src/app/features/contacts/data-access/services",
    "frontend/src/app/features/contacts/data-access/models",
    "frontend/src/app/features/contacts/ui/components",
    "frontend/src/app/features/contacts/pages/contact-list",
    "frontend/src/app/features/contacts/pages/contact-detail",
    "frontend/src/app/features/contacts/pages/contact-form",

    "frontend/src/app/features/opportunities/data-access/services",
    "frontend/src/app/features/opportunities/data-access/models",
    "frontend/src/app/features/opportunities/ui/components",
    "frontend/src/app/features/opportunities/pages/opportunity-list",
    "frontend/src/app/features/opportunities/pages/opportunity-detail",
    "frontend/src/app/features/opportunities/pages/opportunity-pipeline",

    "frontend/src/app/features/activities/data-access/services",
    "frontend/src/app/features/activities/data-access/models",
    "frontend/src/app/features/activities/ui/components",
    "frontend/src/app/features/activities/pages/activity-list",
    "frontend/src/app/features/activities/pages/activity-calendar",

    "frontend/src/app/features/products/data-access/services",
    "frontend/src/app/features/products/data-access/models",
    "frontend/src/app/features/products/ui/components",
    "frontend/src/app/features/products/pages/product-list",
    "frontend/src/app/features/products/pages/product-detail",

    "frontend/src/app/features/quotes/data-access/services",
    "frontend/src/app/features/quotes/data-access/models",
    "frontend/src/app/features/quotes/ui/components",
    "frontend/src/app/features/quotes/pages/quote-list",
    "frontend/src/app/features/quotes/pages/quote-detail",
    "frontend/src/app/features/quotes/pages/quote-form",

    "frontend/src/app/features/reports/data-access/services",
    "frontend/src/app/features/reports/data-access/models",
    "frontend/src/app/features/reports/ui/components",
    "frontend/src/app/features/reports/pages/reports-home",
    "frontend/src/app/features/reports/pages/sales-report",

    "frontend/src/app/features/admin/data-access/services",
    "frontend/src/app/features/admin/data-access/models",
    "frontend/src/app/features/admin/ui/components",
    "frontend/src/app/features/admin/pages/user-management",
    "frontend/src/app/features/admin/pages/role-management",
    "frontend/src/app/features/admin/pages/system-settings",

    "frontend/src/app/features/profile/data-access/services",
    "frontend/src/app/features/profile/data-access/models",
    "frontend/src/app/features/profile/ui/components",
    "frontend/src/app/features/profile/pages/user-profile",
    "frontend/src/app/features/profile/pages/change-password"
)

# Backend feature modules (vertical slices with clean architecture layers)
$modules = @("auth", "account", "contact", "opportunity", "activity", "product", "quote", "user", "dashboard", "admin", "notification")

$moduleLayers = @(
    "domain/model",
    "domain/repository",
    "domain/service",
    "domain/event",
    "application/service",
    "application/port/in",
    "application/port/out",
    "application/command",
    "application/query",
    "infrastructure/persistence/entity",
    "infrastructure/persistence/repository",
    "infrastructure/persistence/mapper",
    "infrastructure/adapter",
    "api/rest/controller",
    "api/rest/dto/request",
    "api/rest/dto/response",
    "api/rest/mapper"
)

foreach ($module in $modules) {
    foreach ($layer in $moduleLayers) {
        $dirs += "backend/src/main/java/com/topnet/crm/modules/$module/$layer"
    }
    $dirs += "backend/src/test/java/com/topnet/crm/modules/$module/unit"
    $dirs += "backend/src/test/java/com/topnet/crm/modules/$module/integration"
}

foreach ($dir in $dirs) {
    $fullPath = Join-Path $root $dir
    New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    $gitkeep = Join-Path $fullPath ".gitkeep"
    if (-not (Test-Path $gitkeep)) {
        New-Item -ItemType File -Path $gitkeep -Force | Out-Null
    }
}

Write-Host "Created $($dirs.Count) directories."
