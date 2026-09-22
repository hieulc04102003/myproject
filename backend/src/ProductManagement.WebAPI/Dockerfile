FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY ["src/ProductManagement.WebAPI/ProductManagement.WebAPI.csproj", "src/ProductManagement.WebAPI/"]
COPY ["src/ProductManagement.Application/ProductManagement.Application.csproj", "src/ProductManagement.Application/"]
COPY ["src/ProductManagement.Infrastructure/ProductManagement.Infrastructure.csproj", "src/ProductManagement.Infrastructure/"]
COPY ["src/ProductManagement.Domain/ProductManagement.Domain.csproj", "src/ProductManagement.Domain/"]

RUN dotnet restore "src/ProductManagement.WebAPI/ProductManagement.WebAPI.csproj"

# copy everything else and build
COPY . .
WORKDIR "/src/src/ProductManagement.WebAPI"
RUN dotnet publish "ProductManagement.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
# Run the app on port 5000 inside the container so it matches the project dev port
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ProductManagement.WebAPI.dll"]
