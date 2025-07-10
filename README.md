# hackathon-go

This project is a Go application that processes CSV files. It allows users to upload a CSV file, processes it, and then provides endpoints to view and export the results.

## How it Works

The application consists of a Go backend that uses the Gin framework for handling HTTP requests. It uses Redis for temporary data storage between processing steps.

When a file is uploaded to the `/upload` endpoint, it is processed, and a `job_id` is returned. This `job_id` can then be used to retrieve the processing results or export them.

## Prerequisites

- Docker
- Docker Compose

## How to Run

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd hackathon-go
    ```

2.  **Run the application using Docker Compose:**
    ```sh
    docker-compose up --build
    ```

The application will be available at `http://localhost:8080`.

## API Endpoints

-   `POST /upload`
    -   Uploads a CSV file for processing.
    -   **Form field:** `file`
    -   **Returns:** A JSON object with a `job_id`.

-   `GET /results/:job_id`
    -   Retrieves the results of a processed job.
    -   **URL parameter:** `job_id`
    -   **Returns:** A JSON object with the processing results.

-   `GET /jobs`
    -   Retrieves all job IDs.
    -   **Returns:** A JSON object with a list of `job_ids`. 

-   `GET /ws/:job_id`
    -   Establishes a WebSocket connection to stream **live progress updates** for a given job.
    -   **URL parameter:** `job_id`
    -   **Messages Format:**
        -   Status updates
            ```json
            { "type": "status", "status": "parsing_csv" }
            ```
            Possible `status` values include `job_created`, `parsing_csv`, `csv_parsed`, `fetching_api_products`, `api_products_fetched`, `comparing_products`, `comparison_done`, `saved_results`, `finished`, `error_parsing_csv`, and `error_fetching_api_products`.
        -   Progress updates
            ```json
            { "type": "progress", "progress": 0.42 }
            ```
            The `progress` field is a float between 0 and `1`, representing the proportion of API pages fetched.

    -   **Example JavaScript client:**
        ```js
        const socket = new WebSocket("ws://localhost:8080/ws/" + jobId);

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "status") {
            console.log("Status:", data.status);
          } else if (data.type === "progress") {
            console.log(`Progress: ${data.progress * 100}%`);
          }
        };
        ``` 