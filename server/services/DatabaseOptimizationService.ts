/**
 * DatabaseOptimizationService - Enterprise database optimization for 400,000+ suppliers
 * 
 * Features:
 * - Strategic indexing for optimal query performance
 * - Stored procedures for complex operations
 * - Materialized views for heavy reporting
 * - Query optimization and performance monitoring
 * - Automatic maintenance tasks
 */

import { Database } from '../db';
import { sql } from 'drizzle-orm';
import { performance } from 'perf_hooks';

export class DatabaseOptimizationService {
  private static instance: DatabaseOptimizationService;
  private db: Database;

  private constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database): DatabaseOptimizationService {
    if (!DatabaseOptimizationService.instance) {
      DatabaseOptimizationService.instance = new DatabaseOptimizationService(db);
    }
    return DatabaseOptimizationService.instance;
  }

  /**
   * Create strategic indexes for supplier operations
   */
  async createSupplierIndexes(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('🔧 Creating supplier performance indexes...');
      
      // Core supplier indexes
      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_id 
        ON suppliers(user_id);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_category 
        ON suppliers(user_id, category);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_country 
        ON suppliers(user_id, country);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_status 
        ON suppliers(user_id, status);
      `);

      // Text search indexes
      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_trade_name_gin 
        ON suppliers USING gin(to_tsvector('portuguese', trade_name));
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_corporate_name_gin 
        ON suppliers USING gin(to_tsvector('portuguese', corporate_name));
      `);

      // Composite indexes for common queries
      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_verified_created 
        ON suppliers(user_id, is_verified, created_at);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_user_status_category 
        ON suppliers(user_id, status, category);
      `);

      // Related table indexes
      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_contacts_supplier_id 
        ON supplier_contacts(supplier_id);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_brands_supplier_id 
        ON supplier_brands(supplier_id);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_files_supplier_id 
        ON supplier_files(supplier_id);
      `);

      await this.db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_conversations_supplier_user 
        ON supplier_conversations(supplier_id, user_id);
      `);

      const duration = performance.now() - startTime;
      console.log(`✅ Supplier indexes created in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error creating supplier indexes:', error);
      throw error;
    }
  }

  /**
   * Create stored procedures for complex supplier operations
   */
  async createSupplierStoredProcedures(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('🔧 Creating supplier stored procedures...');
      
      // Stored procedure for user supplier statistics
      await this.db.execute(sql`
        CREATE OR REPLACE FUNCTION get_user_supplier_stats(p_user_id INT)
        RETURNS TABLE (
          total_suppliers INT,
          verified_suppliers INT,
          active_suppliers INT,
          categories JSON,
          countries JSON,
          statuses JSON
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            COUNT(*)::INT as total_suppliers,
            COUNT(*) FILTER (WHERE is_verified = true)::INT as verified_suppliers,
            COUNT(*) FILTER (WHERE status = 'ativo')::INT as active_suppliers,
            (
              SELECT json_object_agg(category, count)
              FROM (
                SELECT category, COUNT(*) as count
                FROM suppliers
                WHERE user_id = p_user_id
                GROUP BY category
              ) cat_counts
            ) as categories,
            (
              SELECT json_object_agg(country, count)
              FROM (
                SELECT country, COUNT(*) as count
                FROM suppliers
                WHERE user_id = p_user_id
                GROUP BY country
              ) country_counts
            ) as countries,
            (
              SELECT json_object_agg(status, count)
              FROM (
                SELECT status, COUNT(*) as count
                FROM suppliers
                WHERE user_id = p_user_id
                GROUP BY status
              ) status_counts
            ) as statuses
          FROM suppliers
          WHERE user_id = p_user_id;
        END;
        $$;
      `);

      // Stored procedure for supplier search
      await this.db.execute(sql`
        CREATE OR REPLACE FUNCTION search_suppliers(
          p_user_id INT,
          p_search_term TEXT,
          p_category TEXT DEFAULT NULL,
          p_country TEXT DEFAULT NULL,
          p_state TEXT DEFAULT NULL,
          p_status TEXT DEFAULT NULL,
          p_limit INT DEFAULT 50,
          p_offset INT DEFAULT 0
        )
        RETURNS TABLE (
          id INT,
          trade_name TEXT,
          corporate_name TEXT,
          category TEXT,
          country TEXT,
          state TEXT,
          city TEXT,
          status TEXT,
          is_verified BOOLEAN,
          phone TEXT,
          email TEXT,
          website TEXT,
          average_rating DECIMAL,
          total_reviews INT,
          created_at TIMESTAMP,
          updated_at TIMESTAMP
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            s.id,
            s.trade_name,
            s.corporate_name,
            s.category,
            s.country,
            s.state,
            s.city,
            s.status,
            s.is_verified,
            s.phone,
            s.email,
            s.website,
            s.average_rating,
            s.total_reviews,
            s.created_at,
            s.updated_at
          FROM suppliers s
          WHERE s.user_id = p_user_id
            AND (p_search_term IS NULL OR (
              s.trade_name ILIKE '%' || p_search_term || '%' OR
              s.corporate_name ILIKE '%' || p_search_term || '%' OR
              s.email ILIKE '%' || p_search_term || '%'
            ))
            AND (p_category IS NULL OR s.category = p_category)
            AND (p_country IS NULL OR s.country = p_country)
            AND (p_state IS NULL OR s.state = p_state)
            AND (p_status IS NULL OR s.status = p_status)
          ORDER BY s.is_verified DESC, s.trade_name ASC
          LIMIT p_limit OFFSET p_offset;
        END;
        $$;
      `);

      // Stored procedure for bulk supplier status update
      await this.db.execute(sql`
        CREATE OR REPLACE FUNCTION bulk_update_supplier_status(
          p_user_id INT,
          p_supplier_ids INT[],
          p_status TEXT
        )
        RETURNS INT
        LANGUAGE plpgsql
        AS $$
        DECLARE
          updated_count INT;
        BEGIN
          UPDATE suppliers 
          SET status = p_status, updated_at = NOW()
          WHERE user_id = p_user_id 
            AND id = ANY(p_supplier_ids);
          
          GET DIAGNOSTICS updated_count = ROW_COUNT;
          RETURN updated_count;
        END;
        $$;
      `);

      const duration = performance.now() - startTime;
      console.log(`✅ Supplier stored procedures created in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error creating supplier stored procedures:', error);
      throw error;
    }
  }

  /**
   * Create materialized views for heavy reporting
   */
  async createSupplierMaterializedViews(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('🔧 Creating supplier materialized views...');
      
      // User supplier summary view
      await this.db.execute(sql`
        CREATE MATERIALIZED VIEW IF NOT EXISTS user_supplier_summary AS
        SELECT 
          s.user_id,
          COUNT(*) as total_suppliers,
          COUNT(*) FILTER (WHERE s.is_verified = true) as verified_suppliers,
          COUNT(*) FILTER (WHERE s.status = 'ativo') as active_suppliers,
          COUNT(*) FILTER (WHERE s.created_at >= NOW() - INTERVAL '30 days') as recent_suppliers,
          AVG(s.average_rating) as avg_rating,
          SUM(s.total_reviews) as total_reviews,
          MAX(s.created_at) as last_supplier_added
        FROM suppliers s
        GROUP BY s.user_id;
      `);

      // Create unique index for the materialized view
      await this.db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_supplier_summary_user_id 
        ON user_supplier_summary(user_id);
      `);

      // Popular categories view
      await this.db.execute(sql`
        CREATE MATERIALIZED VIEW IF NOT EXISTS popular_supplier_categories AS
        SELECT 
          category,
          COUNT(*) as supplier_count,
          AVG(average_rating) as avg_rating,
          COUNT(DISTINCT user_id) as user_count
        FROM suppliers
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY supplier_count DESC;
      `);

      // System metrics view
      await this.db.execute(sql`
        CREATE MATERIALIZED VIEW IF NOT EXISTS supplier_system_metrics AS
        SELECT 
          COUNT(*) as total_suppliers,
          COUNT(DISTINCT user_id) as total_users,
          AVG(supplier_count) as avg_suppliers_per_user,
          MAX(supplier_count) as max_suppliers_per_user,
          MIN(supplier_count) as min_suppliers_per_user
        FROM (
          SELECT user_id, COUNT(*) as supplier_count
          FROM suppliers
          GROUP BY user_id
        ) user_counts;
      `);

      const duration = performance.now() - startTime;
      console.log(`✅ Supplier materialized views created in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error creating supplier materialized views:', error);
      throw error;
    }
  }

  /**
   * Refresh materialized views
   */
  async refreshSupplierMaterializedViews(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('🔄 Refreshing supplier materialized views...');
      
      await Promise.all([
        this.db.execute(sql`REFRESH MATERIALIZED VIEW user_supplier_summary;`),
        this.db.execute(sql`REFRESH MATERIALIZED VIEW popular_supplier_categories;`),
        this.db.execute(sql`REFRESH MATERIALIZED VIEW supplier_system_metrics;`),
      ]);

      const duration = performance.now() - startTime;
      console.log(`✅ Supplier materialized views refreshed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error refreshing supplier materialized views:', error);
      throw error;
    }
  }

  /**
   * Initialize all supplier optimizations
   */
  async initializeSupplierOptimizations(): Promise<void> {
    const startTime = performance.now();
    
    try {
      console.log('🚀 Initializing supplier database optimizations...');
      
      await this.createSupplierIndexes();
      await this.createSupplierStoredProcedures();
      await this.createSupplierMaterializedViews();
      
      const duration = performance.now() - startTime;
      console.log(`✅ Supplier database optimizations initialized in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Error initializing supplier optimizations:', error);
      throw error;
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeSupplierQueryPerformance(): Promise<any> {
    try {
      console.log('📊 Analyzing supplier query performance...');
      
      // Check index usage
      const indexUsage = await this.db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE tablename IN ('suppliers', 'supplier_contacts', 'supplier_brands', 'supplier_files')
        ORDER BY idx_scan DESC;
      `);

      // Check table statistics
      const tableStats = await this.db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          n_tup_ins,
          n_tup_upd,
          n_tup_del
        FROM pg_stat_user_tables
        WHERE tablename IN ('suppliers', 'supplier_contacts', 'supplier_brands', 'supplier_files')
        ORDER BY seq_scan DESC;
      `);

      return {
        indexUsage: indexUsage.rows,
        tableStats: tableStats.rows,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error analyzing supplier query performance:', error);
      throw error;
    }
  }

  /**
   * Get database health metrics
   */
  async getDatabaseHealthMetrics(): Promise<any> {
    try {
      // Database size
      const dbSize = await this.db.execute(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
      `);

      // Table sizes
      const tableSizes = await this.db.execute(sql`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE tablename IN ('suppliers', 'supplier_contacts', 'supplier_brands', 'supplier_files')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `);

      // Active connections
      const connections = await this.db.execute(sql`
        SELECT count(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active';
      `);

      return {
        databaseSize: dbSize.rows[0],
        tableSizes: tableSizes.rows,
        activeConnections: connections.rows[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error getting database health metrics:', error);
      throw error;
    }
  }

  /**
   * Setup automatic maintenance tasks
   */
  async setupMaintenanceTasks(): Promise<void> {
    try {
      console.log('🔧 Setting up supplier maintenance tasks...');
      
      // Schedule materialized view refresh (every 30 minutes)
      setInterval(async () => {
        try {
          await this.refreshSupplierMaterializedViews();
        } catch (error) {
          console.error('Error in scheduled materialized view refresh:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes

      console.log('✅ Supplier maintenance tasks set up');
    } catch (error) {
      console.error('❌ Error setting up maintenance tasks:', error);
      throw error;
    }
  }
}