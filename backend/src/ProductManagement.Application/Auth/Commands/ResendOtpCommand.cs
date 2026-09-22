using MediatR;
using ProductManagement.Application.Auth.Requests;
using ProductManagement.Application.Auth.Responses;

namespace ProductManagement.Application.Auth.Commands;

public record ResendOtpCommand(ResendOtpRequest Request) : IRequest<ResendOtpResponse>;
