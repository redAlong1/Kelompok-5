using AdinsLibrary.Models;
using Microsoft.EntityFrameworkCore;

namespace AdinsLibrary.Data
{
    public class AdInsLibraryDbContext : DbContext
    {
        public AdInsLibraryDbContext(DbContextOptions<AdInsLibraryDbContext> options)
           : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<MembershipTier> MembershipTiers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Publisher> Publishers { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<BookBorrowingTransaction> BookBorrowingTransactions { get; set; }
        public DbSet<BookReservation> BookReservations { get; set; }
        public DbSet<BorrowingItem> BorrowingItems { get; set; }
        public DbSet<Fine> Fines { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.RoleName)
                .IsUnique();

            modelBuilder.Entity<MembershipTier>()
                .HasIndex(mt => mt.TierName)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.CategoryName)
                .IsUnique();

            modelBuilder.Entity<Book>()
                .HasIndex(b => b.Isbn)
                .IsUnique();

            modelBuilder.Entity<Inventory>()
                .Property(i => i.AvailabilityStatus)
                .HasConversion<string>();

            modelBuilder.Entity<BookBorrowingTransaction>()
                .Property(bb => bb.BookTransactionStatus)
                .HasConversion<string>();

            modelBuilder.Entity<BookReservation>()
                .Property(br => br.BookReservationStatus)
                .HasConversion<string>();

            modelBuilder.Entity<Fine>()
                .Property(f => f.FineStatus)
                .HasConversion<string>();

            // Relasi One-to-Many: Role -> User
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relasi One-to-Many: MembershipTier -> User
            modelBuilder.Entity<User>()
                .HasOne(u => u.MembershipTier)
                .WithMany(mt => mt.Users)
                .HasForeignKey(u => u.MembershipTierId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relasi One-to-Many: Author -> Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId);

            // Relasi One-to-Many: Category -> Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId);

            // Relasi One-to-Many: Publisher -> Book
            modelBuilder.Entity<Book>()
                .HasOne(b => b.Publisher)
                .WithMany(p => p.Books)
                .HasForeignKey(b => b.PublisherId);

            // Relasi One-to-Many: Book -> Inventory
            modelBuilder.Entity<Inventory>()
                .HasOne(i => i.Books)
                .WithMany(b => b.)
                .HasForeignKey(i => i.BookId);

            // Relasi One-to-Many: User -> BookBorrowingTransaction
            modelBuilder.Entity<BookBorrowingTransaction>()
                .HasOne(bbt => bbt.User)
                .WithMany(u => u.)
                .HasForeignKey(bbt => bbt.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relasi One-to-Many: User -> BookReservation
            modelBuilder.Entity<BookReservation>()
                .HasOne(br => br.User)
                .WithMany(u => u.)
                .HasForeignKey(br => br.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relasi One-to-Many: Book -> BookReservation
            modelBuilder.Entity<BookReservation>()
                .HasOne(br => br.Book)
                .WithMany(b => b.BookReservations)
                .HasForeignKey(br => br.BookId);

            // Relasi One-to-Many: BookBorrowingTransaction -> BorrowingItem
            modelBuilder.Entity<BorrowingItem>()
                .HasOne(bi => bi.BookBorrowingTransaction)
                .WithMany(bbt => bbt.BorrowingItems)
                .HasForeignKey(bi => bi.BookBorrowingTransactionId);

            // Relasi One-to-Many: Inventory -> BorrowingItem
            modelBuilder.Entity<BorrowingItem>()
                .HasOne(bi => bi.Inventory)
                .WithMany(i => i.BorrowingItems)
                .HasForeignKey(bi => bi.InventoryId);

            // Konfigurasi Composite Unique Index untuk BorrowingItem
            modelBuilder.Entity<BorrowingItem>()
                .HasIndex(bi => new { bi.BookBorrowingTransactionId, bi.InventoryId })
                .IsUnique();

            // Relasi One-to-One / One-to-Many: BorrowingItem -> Fine
            modelBuilder.Entity<Fine>()
                .HasOne(f => f.BorrowingItem)
                .WithMany(bi => bi.Fines) // atau WithOne() jika relasinya strictly 1-to-1
                .HasForeignKey(f => f.BorrowingItemId);
        }
    }
    }
