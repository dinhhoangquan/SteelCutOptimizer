# Sử dụng image Node.js chính thức làm base image
FROM node:18

# Cài đặt Python và pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Cài đặt thư viện pulp
RUN python3 -m pip install pulp

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json để cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng (nếu có bước build)
RUN npm run build

# Chạy ứng dụng
CMD ["npm", "start"]