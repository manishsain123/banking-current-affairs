# Stage 1: Build .NET 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files
COPY BankingCurrentAffairs.sln ./
COPY src/BankingCurrentAffairs.Core/*.csproj ./src/BankingCurrentAffairs.Core/
COPY src/BankingCurrentAffairs.Infrastructure/*.csproj ./src/BankingCurrentAffairs.Infrastructure/
COPY src/BankingCurrentAffairs.Api/*.csproj ./src/BankingCurrentAffairs.Api/

# Restore dependencies
RUN dotnet restore src/BankingCurrentAffairs.Api/BankingCurrentAffairs.Api.csproj

# Copy all source code
COPY src/ ./src/

# Build and publish release
WORKDIR /app/src/BankingCurrentAffairs.Api
RUN dotnet publish -c Release -o /out

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for container health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /out ./

# Render injects PORT dynamically (default: 10000)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BankingCurrentAffairs.Api.dll"]
