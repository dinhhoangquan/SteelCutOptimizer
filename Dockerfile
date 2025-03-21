# Sử dụng image Node.js làm base
FROM node:18

# Cài đặt các công cụ cần thiết
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Tạo virtual environment
RUN python3 -m venv /opt/venv

# Kích hoạt virtual environment và cài đặt pulp
RUN /opt/venv/bin/pip install pulp

# Cài đặt các dependencies của Node.js
WORKDIR /opt/render/project/src
COPY package.json package-lock.json ./
RUN npm install

# Copy mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Khởi động ứng dụng
CMD ["npm", "start"]