using MediatR;
using ProductManagement.Application.Orders.Requests;
using ProductManagement.Application.Common.Dto;

namespace ProductManagement.Application.Orders.Commands;

public record CreateOrderCommand(CreateOrderRequest Request) : IRequest<ProductManagement.Application.Common.Dto.OrderDto>;
