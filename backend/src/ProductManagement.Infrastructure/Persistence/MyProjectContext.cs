using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ProductManagement.Application.Common.Interfaces;
using ProductManagement.Domain.Entities;

namespace ProductManagement.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext được scaffold từ PostgreSQL database
/// Implements IUnitOfWork pattern
/// </summary>
public partial class MyProjectContext : DbContext, IUnitOfWork
{
    public MyProjectContext()
    {
    }

    public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default)
    {
        // Use EF Core transaction API
        await using var tx = await Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var result = await operation();
            await SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public MyProjectContext(DbContextOptions<MyProjectContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Coupon> Coupons { get; set; }

    public virtual DbSet<CouponUsage> CouponUsages { get; set; }

    public virtual DbSet<Option> Options { get; set; }

    public virtual DbSet<OptionGroup> OptionGroups { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<OrderItemOption> OrderItemOptions { get; set; }

    public virtual DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Otp> Otps { get; set; }

    public virtual DbSet<ProductOptionGroup> ProductOptionGroups { get; set; }

    public virtual DbSet<ProductReview> ProductReviews { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // If DbContext is not configured (e.g., when used outside DI), fall back to a local connection string.
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=127.0.0.1;Database=MyProject;Username=postgres;Password=123456");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("pgcrypto");

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("carts_pkey");

            entity.ToTable("carts");

            entity.HasIndex(e => e.UserId, "carts_user_id_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Cart)
                .HasForeignKey<Cart>(d => d.UserId)
                .HasConstraintName("carts_user_id_fkey");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("cart_items_pkey");

            entity.ToTable("cart_items");

            entity.HasIndex(e => e.CartId, "idx_cart_items_cart");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CartId).HasColumnName("cart_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .HasConstraintName("cart_items_cart_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("cart_items_product_id_fkey");

            entity.HasMany(d => d.Options).WithMany(p => p.CartItems)
                .UsingEntity<Dictionary<string, object>>(
                    "CartItemOption",
                    r => r.HasOne<Option>().WithMany()
                        .HasForeignKey("OptionId")
                        .HasConstraintName("cart_item_options_option_id_fkey"),
                    l => l.HasOne<CartItem>().WithMany()
                        .HasForeignKey("CartItemId")
                        .HasConstraintName("cart_item_options_cart_item_id_fkey"),
                    j =>
                    {
                        j.HasKey("CartItemId", "OptionId").HasName("cart_item_options_pkey");
                        j.ToTable("cart_item_options");
                        j.IndexerProperty<Guid>("CartItemId").HasColumnName("cart_item_id");
                        j.IndexerProperty<Guid>("OptionId").HasColumnName("option_id");
                    });
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("categories_pkey");

            entity.ToTable("categories");

            entity.HasIndex(e => e.Slug, "categories_slug_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("display_order");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Slug)
                .HasMaxLength(100)
                .HasColumnName("slug");
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("coupons_pkey");

            entity.ToTable("coupons");

            entity.HasIndex(e => e.Code, "coupons_code_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DiscountType)
                .HasMaxLength(20)
                .HasColumnName("discount_type");
            entity.Property(e => e.DiscountValue)
                .HasPrecision(12)
                .HasColumnName("discount_value");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MaxDiscountAmount)
                .HasPrecision(12)
                .HasDefaultValueSql("NULL::numeric")
                .HasColumnName("max_discount_amount");
            entity.Property(e => e.MinOrderAmount)
                .HasPrecision(12)
                .HasDefaultValueSql("0")
                .HasColumnName("min_order_amount");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.UsageLimit).HasColumnName("usage_limit");
            entity.Property(e => e.UsedCount)
                .HasDefaultValue(0)
                .HasColumnName("used_count");
        });

        modelBuilder.Entity<CouponUsage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("coupon_usages_pkey");

            entity.ToTable("coupon_usages");

            entity.HasIndex(e => new { e.CouponId, e.UserId }, "idx_coupon_usages");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CouponId).HasColumnName("coupon_id");
            entity.Property(e => e.UsedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("used_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Coupon).WithMany(p => p.CouponUsages)
                .HasForeignKey(d => d.CouponId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("coupon_usages_coupon_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.CouponUsages)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("coupon_usages_user_id_fkey");
        });

        modelBuilder.Entity<Option>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("options_pkey");

            entity.ToTable("options");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("display_order");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("is_available");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.OptionGroupId).HasColumnName("option_group_id");
            entity.Property(e => e.PriceModifier)
                .HasPrecision(12)
                .HasColumnName("price_modifier");

            entity.HasOne(d => d.OptionGroup).WithMany(p => p.Options)
                .HasForeignKey(d => d.OptionGroupId)
                .HasConstraintName("options_option_group_id_fkey");
        });

        modelBuilder.Entity<OptionGroup>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("option_groups_pkey");

            entity.ToTable("option_groups");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRequired)
                .HasDefaultValue(false)
                .HasColumnName("is_required");
            entity.Property(e => e.MaxSelection)
                .HasDefaultValue(0)
                .HasColumnName("max_selection");
            entity.Property(e => e.MinSelection)
                .HasDefaultValue(0)
                .HasColumnName("min_selection");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.SelectionType)
                .HasMaxLength(20)
                .HasColumnName("selection_type");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orders_pkey");

            entity.ToTable("orders", t => t.HasCheckConstraint(
                "orders_payment_method_check",
                "payment_method IN ('CASH', 'BANK_TRANSFER')"));

            entity.HasIndex(e => new { e.CreatedAt, e.OrderStatus, e.TotalAmount }, "idx_orders_dashboard");

            entity.HasIndex(e => e.OrderStatus, "idx_orders_status");

            entity.HasIndex(e => new { e.UserId, e.CreatedAt }, "idx_orders_user").IsDescending(false, true);

            entity.HasIndex(e => e.OrderCode, "orders_order_code_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CouponId).HasColumnName("coupon_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CustomerName)
                .HasMaxLength(100)
                .HasColumnName("customer_name");
            entity.Property(e => e.CustomerPhone)
                .HasMaxLength(20)
                .HasColumnName("customer_phone");
            entity.Property(e => e.DiscountAmount)
                .HasPrecision(12)
                .HasColumnName("discount_amount");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.OrderCode)
                .HasMaxLength(20)
                .HasColumnName("order_code");
            entity.Property(e => e.OrderStatus)
                .HasMaxLength(30)
                .HasDefaultValueSql("'PENDING'::character varying")
                .HasColumnName("order_status");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(30)
                .HasColumnName("payment_method");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(30)
                .HasDefaultValueSql("'UNPAID'::character varying")
                .HasColumnName("payment_status");
            entity.Property(e => e.ShippingAddress).HasColumnName("shipping_address");
            entity.Property(e => e.ShippingFee)
                .HasPrecision(12)
                .HasColumnName("shipping_fee");
            entity.Property(e => e.Subtotal)
                .HasPrecision(12)
                .HasColumnName("subtotal");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(12)
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Coupon).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CouponId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("orders_coupon_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("orders_user_id_fkey");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_items_pkey");

            entity.ToTable("order_items");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ItemNote).HasColumnName("item_note");
            entity.Property(e => e.ItemTotalPrice)
                .HasPrecision(12)
                .HasColumnName("item_total_price");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ProductName)
                .HasMaxLength(255)
                .HasColumnName("product_name");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(12)
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_items_order_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_items_product_id_fkey");
        });

        modelBuilder.Entity<OrderItemOption>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_item_options_pkey");

            entity.ToTable("order_item_options");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.OptionId).HasColumnName("option_id");
            entity.Property(e => e.OptionName)
                .HasMaxLength(100)
                .HasColumnName("option_name");
            entity.Property(e => e.OptionPrice)
                .HasPrecision(12)
                .HasColumnName("option_price");
            entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");

            entity.HasOne(d => d.Option).WithMany(p => p.OrderItemOptions)
                .HasForeignKey(d => d.OptionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_item_options_option_id_fkey");

            entity.HasOne(d => d.OrderItem).WithMany(p => p.OrderItemOptions)
                .HasForeignKey(d => d.OrderItemId)
                .HasConstraintName("order_item_options_order_item_id_fkey");
        });

        modelBuilder.Entity<OrderStatusHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_status_history_pkey");

            entity.ToTable("order_status_history");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ChangedByUserId).HasColumnName("changed_by_user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.NewStatus)
                .HasMaxLength(30)
                .HasColumnName("new_status");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PreviousStatus)
                .HasMaxLength(30)
                .HasColumnName("previous_status");

            entity.HasOne(d => d.ChangedByUser).WithMany(p => p.OrderStatusHistories)
                .HasForeignKey(d => d.ChangedByUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_status_history_changed_by_user_id_fkey");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderStatusHistories)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_status_history_order_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("products_pkey");

            entity.ToTable("products");

            entity.HasIndex(e => new { e.CategoryId, e.IsAvailable }, "idx_products_catalog");

            entity.HasIndex(e => e.Slug, "idx_products_slug");

            entity.HasIndex(e => e.Slug, "products_slug_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.BasePrice)
                .HasPrecision(12)
                .HasColumnName("base_price");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.IsAvailable)
                .HasDefaultValue(true)
                .HasColumnName("is_available");
            entity.Property(e => e.IsFeatured)
                .HasDefaultValue(false)
                .HasColumnName("is_featured");
            entity.Property(e => e.StockQuantity)
                .HasDefaultValue(0)
                .HasColumnName("stock_quantity");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Slug)
                .HasMaxLength(255)
                .HasColumnName("slug");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("products_category_id_fkey");
        });

        modelBuilder.Entity<ProductOptionGroup>(entity =>
        {
            entity.HasKey(e => new { e.ProductId, e.OptionGroupId }).HasName("product_option_groups_pkey");

            entity.ToTable("product_option_groups");

            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.OptionGroupId).HasColumnName("option_group_id");
            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0)
                .HasColumnName("display_order");

            entity.HasOne(d => d.OptionGroup).WithMany(p => p.ProductOptionGroups)
                .HasForeignKey(d => d.OptionGroupId)
                .HasConstraintName("product_option_groups_option_group_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductOptionGroups)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("product_option_groups_product_id_fkey");
        });

        modelBuilder.Entity<ProductReview>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("product_reviews_pkey");

            entity.ToTable("product_reviews");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Order).WithMany(p => p.ProductReviews)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("product_reviews_order_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductReviews)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("product_reviews_product_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ProductReviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("product_reviews_user_id_fkey");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("refresh_tokens_pkey");

            entity.ToTable("refresh_tokens");

            entity.HasIndex(e => new { e.UserId, e.Token }, "idx_refresh_tokens_lookup").HasFilter("(is_revoked IS FALSE)");

            entity.HasIndex(e => e.Token, "refresh_tokens_token_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedByIp)
                .HasMaxLength(45)
                .HasColumnName("created_by_ip");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.IsRevoked)
                .HasDefaultValue(false)
                .HasColumnName("is_revoked");
            entity.Property(e => e.Token)
                .HasMaxLength(500)
                .HasColumnName("token");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("refresh_tokens_user_id_fkey");
        });

        modelBuilder.Entity<Otp>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("otps_pkey");

            entity.ToTable("otps");

            entity.HasIndex(e => new { e.PhoneNumber, e.IsUsed, e.ExpiresAt }, "idx_otps_phone_lookup");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");

            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");

            entity.Property(e => e.OtpCode)
                .HasMaxLength(10)
                .HasColumnName("otp_code");

            entity.Property(e => e.IsUsed)
                .HasDefaultValue(false)
                .HasColumnName("is_used");

            entity.Property(e => e.AttemptsCount)
                .HasDefaultValue(0)
                .HasColumnName("attempts_count");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");

            entity.Property(e => e.LastSentAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("last_sent_at");

            entity.Property(e => e.ExpiresAt)
                .HasColumnName("expires_at");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.PhoneNumber, "idx_users_phone");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.PhoneNumber, "users_phone_number_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsPhoneVerified)
                .HasDefaultValue(false)
                .HasColumnName("is_phone_verified");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updated_at");

            // RBAC: role được quản lý qua bảng user_roles (many-to-many với roles)
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");
            entity.ToTable("roles");
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId }).HasName("user_roles_pkey");
            entity.ToTable("user_roles");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("assigned_at");
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("permissions_pkey");
            entity.ToTable("permissions");
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(100)
                .HasColumnName("code");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.HttpMethod)
                .HasMaxLength(10)
                .HasColumnName("http_method");
            entity.Property(e => e.Url)
                .HasMaxLength(255)
                .HasColumnName("url");
            entity.Property(e => e.Description).HasColumnName("description");

            entity.HasIndex(e => new { e.HttpMethod, e.Url })
                .HasDatabaseName("ix_permissions_http_method_url");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId }).HasName("role_permissions_pkey");
            entity.ToTable("role_permissions");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.PermissionId).HasColumnName("permission_id");
            entity.HasOne(e => e.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_addresses_pkey");

            entity.ToTable("user_addresses");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasDefaultValueSql("'Hồ Chí Minh'::character varying")
                .HasColumnName("city");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("created_at");
            entity.Property(e => e.District)
                .HasMaxLength(100)
                .HasColumnName("district");
            entity.Property(e => e.IsDefault)
                .HasDefaultValue(false)
                .HasColumnName("is_default");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phone_number");
            entity.Property(e => e.RecipientName)
                .HasMaxLength(100)
                .HasColumnName("recipient_name");
            entity.Property(e => e.StreetAddress).HasColumnName("street_address");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Ward)
                .HasMaxLength(100)
                .HasColumnName("ward");

            entity.HasOne(d => d.User).WithMany(p => p.UserAddresses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_addresses_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
