/**
 * CRUD Interface following Interface Segregation Principle
 * Allows classes to implement only the operations they need
 */
export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: CreateT): Promise<T>;
  update(id: number, data: UpdateT): Promise<T>;
  delete(id: number): Promise<void>;
}

export interface SearchableOperations<T> {
  search(query: string): Promise<T[]>;
}

export interface FilterableOperations<T> {
  filter(filters: Record<string, any>): Promise<T[]>;
}

/**
 * Base CRUD Service implementing common operations
 */
export abstract class CrudService<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  implements CrudOperations<T, CreateT, UpdateT> {
  
  protected abstract endpoint: string;
  
  abstract getAll(): Promise<T[]>;
  abstract getById(id: number): Promise<T>;
  abstract create(data: CreateT): Promise<T>;
  abstract update(id: number, data: UpdateT): Promise<T>;
  abstract delete(id: number): Promise<void>;
}