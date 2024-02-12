# Use the official PostgreSQL image from Docker Hub
FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_DB osfk
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD password

# Copy the SQL script to create the table and insert sample data
COPY init.sql /docker-entrypoint-initdb.d/

# Expose the default PostgreSQL port
EXPOSE 5432