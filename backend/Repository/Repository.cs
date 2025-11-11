using WebDev.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly WebDevDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(WebDevDbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public void Add(T entity)
    {
        if (entity == null)
        {
            throw new ArgumentNullException("Reason");
        }

        _dbSet.Add(entity);
    }

    public void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }

    public void Update(T entity) => _dbSet.Update(entity);
    public int SaveChanges() => _context.SaveChanges();

    public T? FindById(Object id)
    {
        return _dbSet.Find(id);
    }

    public IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate)
    {
        return _dbSet.Where(predicate);
    }

    public IEnumerable<T> GetAll()
    {
        return _dbSet.ToList();
    }

    public IQueryable<T> Query() => _dbSet.AsQueryable();

}