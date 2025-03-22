# Sử dụng image Node.js làm base
FROM node:18

# Cài đặt các công cụ cần thiết
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Kiểm tra phiên bản Python và pip
RUN python3 --version
RUN pip3 --version

# Cài đặt pulp trực tiếp vào Python toàn cục, bỏ qua PEP 668
RUN pip3 install pulp --break-system-packages

# Kiểm tra xem pulp đã được cài đặt chưa
RUN python3 -c "import pulp; print('PuLP version:', pulp.__version__)"

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