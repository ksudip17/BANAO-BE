-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROVIDER_ASSIGNED', 'IN_PROGRESS', 'PENDING_FINAL_PAYMENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IssueStarted" AS ENUM ('TODAY', 'YESTERDAY', 'LAST_WEEK', 'OVER_A_WEEK', 'OVER_A_MONTH', 'OVER_A_YEAR', 'LAST_MONTH');

-- CreateEnum
CREATE TYPE "JobWorkSessionStatus" AS ENUM ('ARRIVED', 'STARTED', 'COMPLETED', 'PENDING', 'IN_PROGRESS', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UploadStage" AS ENUM ('REQUEST_PHASE', 'BEFORE_WORK', 'AFTER_WORK');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'ESEWA', 'KHALTI', 'WALLET', 'NET_BANKING', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('INITIAL_DEPOSIT', 'OVERTIME_ADJUSTMENT', 'SCOPE_CHANGE', 'FINAL_PAYMENT');

-- CreateEnum
CREATE TYPE "Module" AS ENUM ('USER', 'ROLE', 'PERMISSION', 'JOB', 'PAYMENT', 'WALLET', 'PROVIDER', 'CUSTOMER', 'BID', 'REVIEW');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('STANDARD', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "TimeSlotExceptionType" AS ENUM ('HOLIDAY', 'UNAVAILABLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'BANNED', 'DEACTIVATED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK_ACCOUNT', 'ESEWA', 'KHALTI');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('ADMIN_SETTLEMENT', 'PROVIDER_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK_TRANSFER', 'ESEWA', 'KHALTI');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "excerpt" TEXT,
    "description" TEXT,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_media" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "alt" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_sub_category_bridge" (
    "job_id" TEXT NOT NULL,
    "sub_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sub_category_bridge_pkey" PRIMARY KEY ("job_id","sub_category_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "severity_level" "SeverityLevel" NOT NULL,
    "issue_started" "IssueStarted" NOT NULL,
    "description" TEXT NOT NULL,
    "customer_address_id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "special_instructions" TEXT,
    "estimated_budget" DECIMAL(10,2),
    "scheduled_date" TIMESTAMP(3),
    "scheduled_time_window" TEXT,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "offered_price" DECIMAL(10,2) NOT NULL,
    "message" TEXT,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requests" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_work_sessions" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "provider_arrived_at" TIMESTAMP(3),
    "notes" TEXT,
    "status" "JobWorkSessionStatus" NOT NULL DEFAULT 'ARRIVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "location_geom" geometry(Point, 4326),

    CONSTRAINT "job_work_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_medias" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "media_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "upload_stage" "UploadStage" NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "platform_commission_amount" DECIMAL(10,2) NOT NULL,
    "payment_purpose" "PaymentPurpose" NOT NULL,
    "net_payable_amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "module" "Module" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission_bridges" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_bridges_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "display_label" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "slot_type" "SlotType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_time_slots" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "time_slot_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_time_slot_days" (
    "id" TEXT NOT NULL,
    "provider_time_slot_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_time_slot_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_time_slot_exceptions" (
    "id" TEXT NOT NULL,
    "provider_time_slot_id" TEXT NOT NULL,
    "exception_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "type" "TimeSlotExceptionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_time_slot_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "userType" "UserType" NOT NULL,
    "two_factor_auth_enabled" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_employees" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "admin_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "location_geometry" geometry(Point, 4326) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "working_location_geometry" geometry(Point, 4326),
    "working_location_address" TEXT,
    "service_radius_km" INTEGER,
    "total_jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "hourly_rate" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "experience" TEXT NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_reviews" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "moderated_by" TEXT,
    "moderation_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_payment_accounts" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "account_holder_name" TEXT NOT NULL,
    "wallet_id_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_wallets" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "available_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "locked_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_withdrawn" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "provider_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "transaction_type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "job_id" TEXT,
    "payout_id" TEXT,
    "balance_before" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payout_type" "PayoutType" NOT NULL,
    "payout_method" "PayoutMethod" NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payment_account_id" TEXT,
    "initiated_by" TEXT,
    "initiated_by_type" TEXT,
    "payment_account_snapshot" JSONB,
    "processed_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE INDEX "blog_categories_is_active_idx" ON "blog_categories"("is_active");

-- CreateIndex
CREATE INDEX "blog_categories_deleted_at_idx" ON "blog_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "blog_categories_is_active_deleted_at_idx" ON "blog_categories"("is_active", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_category_id_idx" ON "blogs"("category_id");

-- CreateIndex
CREATE INDEX "blogs_deleted_at_idx" ON "blogs"("deleted_at");

-- CreateIndex
CREATE INDEX "blogs_is_published_published_at_idx" ON "blogs"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "blogs_is_featured_published_at_idx" ON "blogs"("is_featured", "published_at");

-- CreateIndex
CREATE INDEX "blogs_is_popular_published_at_idx" ON "blogs"("is_popular", "published_at");

-- CreateIndex
CREATE INDEX "blogs_category_id_is_published_published_at_idx" ON "blogs"("category_id", "is_published", "published_at");

-- CreateIndex
CREATE INDEX "blog_media_blog_id_idx" ON "blog_media"("blog_id");

-- CreateIndex
CREATE INDEX "blog_media_media_id_idx" ON "blog_media"("media_id");

-- CreateIndex
CREATE INDEX "blog_media_blog_id_sort_order_idx" ON "blog_media"("blog_id", "sort_order");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_deleted_at_idx" ON "categories"("deleted_at");

-- CreateIndex
CREATE INDEX "sub_categories_category_id_idx" ON "sub_categories"("category_id");

-- CreateIndex
CREATE INDEX "sub_categories_name_idx" ON "sub_categories"("name");

-- CreateIndex
CREATE INDEX "sub_categories_deleted_at_idx" ON "sub_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "job_sub_category_bridge_sub_category_id_job_id_idx" ON "job_sub_category_bridge"("sub_category_id", "job_id");

-- CreateIndex
CREATE INDEX "jobs_category_id_idx" ON "jobs"("category_id");

-- CreateIndex
CREATE INDEX "jobs_customer_id_idx" ON "jobs"("customer_id");

-- CreateIndex
CREATE INDEX "jobs_provider_id_idx" ON "jobs"("provider_id");

-- CreateIndex
CREATE INDEX "jobs_customer_address_id_idx" ON "jobs"("customer_address_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_severity_level_idx" ON "jobs"("severity_level");

-- CreateIndex
CREATE INDEX "jobs_scheduled_date_idx" ON "jobs"("scheduled_date");

-- CreateIndex
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");

-- CreateIndex
CREATE INDEX "jobs_status_scheduled_date_idx" ON "jobs"("status", "scheduled_date");

-- CreateIndex
CREATE INDEX "jobs_category_id_status_scheduled_date_idx" ON "jobs"("category_id", "status", "scheduled_date");

-- CreateIndex
CREATE INDEX "jobs_provider_id_status_scheduled_date_idx" ON "jobs"("provider_id", "status", "scheduled_date");

-- CreateIndex
CREATE INDEX "jobs_customer_id_created_at_idx" ON "jobs"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "jobs_deleted_at_idx" ON "jobs"("deleted_at");

-- CreateIndex
CREATE INDEX "bids_job_id_idx" ON "bids"("job_id");

-- CreateIndex
CREATE INDEX "bids_provider_id_idx" ON "bids"("provider_id");

-- CreateIndex
CREATE INDEX "bids_provider_id_status_created_at_idx" ON "bids"("provider_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "bids_job_id_status_created_at_idx" ON "bids"("job_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "job_requests_job_id_idx" ON "job_requests"("job_id");

-- CreateIndex
CREATE INDEX "job_requests_provider_id_idx" ON "job_requests"("provider_id");

-- CreateIndex
CREATE INDEX "job_requests_job_id_status_idx" ON "job_requests"("job_id", "status");

-- CreateIndex
CREATE INDEX "job_requests_provider_id_status_created_at_idx" ON "job_requests"("provider_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "job_work_sessions_job_id_idx" ON "job_work_sessions"("job_id");

-- CreateIndex
CREATE INDEX "job_work_sessions_job_id_status_idx" ON "job_work_sessions"("job_id", "status");

-- CreateIndex
CREATE INDEX "job_work_sessions_job_id_start_time_idx" ON "job_work_sessions"("job_id", "start_time");

-- CreateIndex
CREATE INDEX "job_work_sessions_status_start_time_idx" ON "job_work_sessions"("status", "start_time");

-- CreateIndex
CREATE INDEX "job_medias_job_id_idx" ON "job_medias"("job_id");

-- CreateIndex
CREATE INDEX "job_medias_job_id_upload_stage_idx" ON "job_medias"("job_id", "upload_stage");

-- CreateIndex
CREATE INDEX "job_medias_uploaded_by_created_at_idx" ON "job_medias"("uploaded_by", "created_at");

-- CreateIndex
CREATE INDEX "payments_customer_id_created_at_idx" ON "payments"("customer_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_provider_id_created_at_idx" ON "payments"("provider_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_job_id_created_at_idx" ON "payments"("job_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- CreateIndex
CREATE INDEX "payments_job_id_payment_purpose_idx" ON "payments"("job_id", "payment_purpose");

-- CreateIndex
CREATE INDEX "payments_provider_id_status_created_at_idx" ON "payments"("provider_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_is_active_idx" ON "roles"("is_active");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

-- CreateIndex
CREATE INDEX "user_roles_role_id_user_id_idx" ON "user_roles"("role_id", "user_id");

-- CreateIndex
CREATE INDEX "permissions_module_action_idx" ON "permissions"("module", "action");

-- CreateIndex
CREATE INDEX "permissions_deleted_at_idx" ON "permissions"("deleted_at");

-- CreateIndex
CREATE INDEX "role_permission_bridges_permission_id_role_id_idx" ON "role_permission_bridges"("permission_id", "role_id");

-- CreateIndex
CREATE INDEX "time_slots_slot_type_start_time_idx" ON "time_slots"("slot_type", "start_time");

-- CreateIndex
CREATE INDEX "time_slots_is_active_start_time_idx" ON "time_slots"("is_active", "start_time");

-- CreateIndex
CREATE INDEX "time_slots_deleted_at_idx" ON "time_slots"("deleted_at");

-- CreateIndex
CREATE INDEX "provider_time_slots_provider_id_is_active_idx" ON "provider_time_slots"("provider_id", "is_active");

-- CreateIndex
CREATE INDEX "provider_time_slots_time_slot_id_provider_id_idx" ON "provider_time_slots"("time_slot_id", "provider_id");

-- CreateIndex
CREATE INDEX "provider_time_slots_deleted_at_idx" ON "provider_time_slots"("deleted_at");

-- CreateIndex
CREATE INDEX "provider_time_slot_days_provider_time_slot_id_day_of_week_idx" ON "provider_time_slot_days"("provider_time_slot_id", "day_of_week");

-- CreateIndex
CREATE INDEX "provider_time_slot_days_day_of_week_is_active_idx" ON "provider_time_slot_days"("day_of_week", "is_active");

-- CreateIndex
CREATE INDEX "provider_time_slot_days_deleted_at_idx" ON "provider_time_slot_days"("deleted_at");

-- CreateIndex
CREATE INDEX "provider_time_slot_exceptions_provider_time_slot_id_excepti_idx" ON "provider_time_slot_exceptions"("provider_time_slot_id", "exception_date");

-- CreateIndex
CREATE INDEX "provider_time_slot_exceptions_exception_date_is_active_idx" ON "provider_time_slot_exceptions"("exception_date", "is_active");

-- CreateIndex
CREATE INDEX "provider_time_slot_exceptions_deleted_at_idx" ON "provider_time_slot_exceptions"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_created_at_idx" ON "users"("status", "created_at");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_employees_user_id_key" ON "admin_employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_employees_employee_code_key" ON "admin_employees"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_user_id_key" ON "customers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "providers_user_id_key" ON "providers"("user_id");

-- CreateIndex
CREATE INDEX "providers_average_rating_idx" ON "providers"("average_rating" DESC);

-- CreateIndex
CREATE INDEX "provider_payment_accounts_provider_id_is_active_idx" ON "provider_payment_accounts"("provider_id", "is_active");

-- CreateIndex
CREATE INDEX "provider_payment_accounts_provider_id_account_type_idx" ON "provider_payment_accounts"("provider_id", "account_type");

-- CreateIndex
CREATE INDEX "provider_payment_accounts_account_type_is_active_idx" ON "provider_payment_accounts"("account_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "provider_wallets_provider_id_key" ON "provider_wallets"("provider_id");

-- CreateIndex
CREATE INDEX "provider_wallets_is_active_idx" ON "provider_wallets"("is_active");

-- CreateIndex
CREATE INDEX "provider_wallet_transactions_wallet_id_created_at_idx" ON "provider_wallet_transactions"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "provider_wallet_transactions_wallet_id_transaction_type_cre_idx" ON "provider_wallet_transactions"("wallet_id", "transaction_type", "created_at");

-- CreateIndex
CREATE INDEX "provider_wallet_transactions_job_id_idx" ON "provider_wallet_transactions"("job_id");

-- CreateIndex
CREATE INDEX "provider_wallet_transactions_payout_id_idx" ON "provider_wallet_transactions"("payout_id");

-- CreateIndex
CREATE INDEX "payouts_provider_id_created_at_idx" ON "payouts"("provider_id", "created_at");

-- CreateIndex
CREATE INDEX "payouts_provider_id_status_created_at_idx" ON "payouts"("provider_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "payouts_wallet_id_created_at_idx" ON "payouts"("wallet_id", "created_at");

-- CreateIndex
CREATE INDEX "payouts_status_created_at_idx" ON "payouts"("status", "created_at");

-- CreateIndex
CREATE INDEX "payouts_payment_account_id_idx" ON "payouts"("payment_account_id");

-- CreateIndex
CREATE INDEX "payouts_initiated_by_created_at_idx" ON "payouts"("initiated_by", "created_at");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_media" ADD CONSTRAINT "blog_media_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_media" ADD CONSTRAINT "blog_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_sub_category_bridge" ADD CONSTRAINT "job_sub_category_bridge_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_sub_category_bridge" ADD CONSTRAINT "job_sub_category_bridge_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_work_sessions" ADD CONSTRAINT "job_work_sessions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_medias" ADD CONSTRAINT "job_medias_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission_bridges" ADD CONSTRAINT "role_permission_bridges_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission_bridges" ADD CONSTRAINT "role_permission_bridges_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_time_slots" ADD CONSTRAINT "provider_time_slots_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_time_slots" ADD CONSTRAINT "provider_time_slots_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_time_slot_days" ADD CONSTRAINT "provider_time_slot_days_provider_time_slot_id_fkey" FOREIGN KEY ("provider_time_slot_id") REFERENCES "provider_time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_time_slot_exceptions" ADD CONSTRAINT "provider_time_slot_exceptions_provider_time_slot_id_fkey" FOREIGN KEY ("provider_time_slot_id") REFERENCES "provider_time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_employees" ADD CONSTRAINT "admin_employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_payment_accounts" ADD CONSTRAINT "provider_payment_accounts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallets" ADD CONSTRAINT "provider_wallets_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_transactions" ADD CONSTRAINT "provider_wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_transactions" ADD CONSTRAINT "provider_wallet_transactions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_transactions" ADD CONSTRAINT "provider_wallet_transactions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "provider_payment_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
