# Lightweight NGINX base for Google Cloud Run
FROM nginx:alpine

# Copy web application assets
COPY . /usr/share/nginx/html

# Copy custom NGINX configuration (configured for Cloud Run port 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Google Cloud Run default ingress port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
