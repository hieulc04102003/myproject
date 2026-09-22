using MediatR;
using ProductManagement.Application.Auth.Requests;
using ProductManagement.Application.Auth.Responses;

namespace ProductManagement.Application.Auth.Commands;

public record RegisterCommand(RegisterRequest Request) : IRequest<RegisterResponse>;
