namespace WebDev.Core.Interfaces;

public interface IOpenaiConnector
{
    Task<string> AskGPT(int userId);
}
