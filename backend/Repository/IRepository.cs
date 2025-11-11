using System.Linq.Expressions;

public interface IRepository<T> where T : class
{
    void Add(T entity);
    void Delete(T entity);
    void Update(T entity);
    int SaveChanges();
    T? FindById(Object id);
    IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
    IEnumerable<T> GetAll();
    IQueryable<T> Query();
}