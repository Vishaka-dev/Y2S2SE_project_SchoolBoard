# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/SchoolBoard-0.0.1-SNAPSHOT.jar app.jar

# Standard Render port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
