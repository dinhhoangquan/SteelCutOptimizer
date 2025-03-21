# Sử dụng image Node.js chính thức làm base image
FROM node:18

# Cài đặt Python và pip, cùng với các dependencies cần thiết
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Tạo virtual environment
RUN python3 -m venv /opt/venv

# Kích hoạt virtual environment và cài đặt pulp
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install pulp

# Thiết lập biến môi trường để sử dụng Python từ virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json để cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng (nếu có bước build)
RUN npm run build || true

# Chạy ứng dụng
CMD ["npm", "start"]